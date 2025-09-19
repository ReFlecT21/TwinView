import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertActivityLogSchema, insertTeamMemberSchema } from "@shared/schema";
import { generateCompetitiveAnalysis, generateOpportunityAssessment, generateDigitalTwinStrategy } from "./openai";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routers/_app';
import { createTRPCContext } from './trpc';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up tRPC middleware
  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: createTRPCContext,
    })
  );

  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const { search, industry, digitalTwinStatus, opportunityScore, country } = req.query;
      
      let companies;
      if (search) {
        companies = await storage.searchCompanies(search as string);
      } else if (industry || digitalTwinStatus || opportunityScore || country) {
        companies = await storage.filterCompanies({
          industry: industry as string,
          digitalTwinStatus: digitalTwinStatus as string,
          opportunityScore: opportunityScore as string,
          country: country as string
        });
      } else {
        companies = await storage.getCompanies();
      }
      
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        companyId: company.id,
        userId: "system",
        userName: "System",
        action: "company_created",
        description: `Added new company: ${company.name}`
      });
      
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const updates = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, updates);
      
      // Log activity
      const changedFields = Object.keys(updates);
      await storage.createActivityLog({
        companyId: company.id,
        userId: "system",
        userName: "System",
        action: "company_updated",
        description: `Updated ${changedFields.join(", ")} for ${company.name}`
      });
      
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Activity Logs
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const { companyId } = req.query;
      const logs = await storage.getActivityLogs(companyId as string);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const validatedData = insertActivityLogSchema.parse(req.body);
      const log = await storage.createActivityLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Team Members
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // AI Analysis
  app.post("/api/companies/:id/generate-competitive-analysis", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const analysis = await generateCompetitiveAnalysis(
        company.name,
        company.industry,
        company.digitalTwinStatus
      );

      // Update company with generated analysis
      await storage.updateCompany(req.params.id, {
        competitiveAnalysis: analysis
      });

      // Log activity
      await storage.createActivityLog({
        companyId: company.id,
        userId: "ai",
        userName: "AI Analysis",
        action: "competitive_analysis_generated",
        description: `Generated competitive analysis for ${company.name}`
      });

      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/companies/:id/generate-opportunity-assessment", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const assessment = await generateOpportunityAssessment(
        company.name,
        company.industry,
        company.revenue || "Unknown",
        company.digitalTwinMaturity
      );

      // Update company with generated assessment
      await storage.updateCompany(req.params.id, {
        opportunityScore: assessment.opportunityScore,
        dellOpportunity: assessment.assessmentNotes
      });

      // Log activity
      await storage.createActivityLog({
        companyId: company.id,
        userId: "ai",
        userName: "AI Analysis",
        action: "opportunity_assessment_generated",
        description: `Generated opportunity assessment for ${company.name} (Score: ${assessment.opportunityScore})`
      });

      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/companies/:id/generate-digital-twin-strategy", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const strategy = await generateDigitalTwinStrategy(
        company.name,
        company.industry,
        company.businessAreas || []
      );

      // Update company with generated strategy
      await storage.updateCompany(req.params.id, {
        digitalTwinStrategy: strategy
      });

      // Log activity
      await storage.createActivityLog({
        companyId: company.id,
        userId: "ai",
        userName: "AI Analysis",
        action: "digital_twin_strategy_generated",
        description: `Generated digital twin strategy analysis for ${company.name}`
      });

      res.json({ strategy });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
