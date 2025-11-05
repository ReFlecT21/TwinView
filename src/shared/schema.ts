import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type"),
  industry: text("industry").notNull(),
  country: text("country").notNull(),
  employees: integer("employees"),
  revenue: text("revenue"),
  headquarters: text("headquarters"),
  ceo: text("ceo"),
  founded: integer("founded"),
  website: text("website"),
  businessAreas: jsonb("business_areas").$type<string[]>().default([]),
  digitalTwinStatus: text("digital_twin_status").notNull().default("not_started"),
  digitalTwinMaturity: integer("digital_twin_maturity").notNull().default(0),
  opportunityScore: integer("opportunity_score").notNull().default(0),
  estimatedDealValue: text("estimated_deal_value"),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  nextFollowUp: timestamp("next_follow_up"),
  notes: text("notes"),
  competitiveAnalysis: text("competitive_analysis"),
  dellOpportunity: text("dell_opportunity"),
  digitalTwinStrategy: text("digital_twin_strategy"),
  // Structured components data
  painPoints: jsonb("pain_points").$type<Array<{title: string, description: string}>>().default([]),
  dellSolutions: jsonb("dell_solutions").$type<Array<{title: string, description: string}>>().default([]),
  nextSteps: jsonb("next_steps").$type<Array<{title: string, description: string}>>().default([]),
  competitors: jsonb("competitors").$type<Array<{title: string, description: string}>>().default([]),
  dellAdvantages: jsonb("dell_advantages").$type<Array<{title: string, description: string}>>().default([]),
  threats: jsonb("threats").$type<Array<{title: string, description: string}>>().default([]),
  differentiation: jsonb("differentiation").$type<Array<{title: string, description: string}>>().default([]),
  winStrategy: jsonb("win_strategy").$type<Array<{title: string, description: string}>>().default([]),
  personnel: jsonb("personnel").$type<Array<{name: string, title: string, email?: string, phone?: string, linkedinUrl?: string, notes?: string}>>().default([]),
  // New LTTS criteria fields
  projects: jsonb("projects").$type<string[]>().default([]),
  dataReliability: text("data_reliability"),
  industryDetails: text("industry_details"),
  existingRelations: text("existing_relations"),
  revenuePotential: text("revenue_potential"),
  marketSizeGrowth: text("market_size_growth"),
  partnerMarketAccess: text("partner_market_access"),
  solutionMaturitySalesReadiness: text("solution_maturity_sales_readiness"),

  // Scoring Framework Fields
  scores: jsonb("scores").$type<{
    dataReliability: number,
    dataReliabilityEvidence: string[],
    existingRelations: number,
    existingRelationsEvidence: string[],
    industry: number,
    industryEvidence: string[],
    revenuePotential: number,
    revenuePotentialEvidence: string[],
    // Revenue Potential Sub-scores
    projects: number,
    projectsEvidence: string[],
    partnerMarketAccess: number,
    partnerMarketAccessEvidence: string[],
    solutionMaturity: number,
    solutionMaturityEvidence: string[],
    partnerScale: number,
    partnerScaleEvidence: string[],
    growthMomentum: number,
    growthMomentumEvidence: string[],
    investmentReadiness: number,
    investmentReadinessEvidence: string[],
    // Calculated scores
    totalScore: number,
    lastUpdated: string,
    updatedBy: string
  }>().default({
    dataReliability: 3,
    dataReliabilityEvidence: [],
    existingRelations: 3,
    existingRelationsEvidence: [],
    industry: 3,
    industryEvidence: [],
    revenuePotential: 3,
    revenuePotentialEvidence: [],
    projects: 3,
    projectsEvidence: [],
    partnerMarketAccess: 3,
    partnerMarketAccessEvidence: [],
    solutionMaturity: 3,
    solutionMaturityEvidence: [],
    partnerScale: 3,
    partnerScaleEvidence: [],
    growthMomentum: 3,
    growthMomentumEvidence: [],
    investmentReadiness: 3,
    investmentReadinessEvidence: [],
    totalScore: 3,
    lastUpdated: new Date().toISOString(),
    updatedBy: ''
  }),
  scoreHistory: jsonb("score_history").$type<Array<{
    date: string,
    totalScore: number,
    changedBy: string,
    changes: string
  }>>().default([]),
  comparisonNotes: text("comparison_notes"),
  confidenceLevel: integer("confidence_level").default(3),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey(), // This will be the Clerk user ID
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role"),
  department: text("department"),
  joinedAt: timestamp("joined_at").default(sql`now()`),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  lastUpdated: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  joinedAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export const digitalTwinStatuses = [
  "not_started",
  "researching", 
  "implementing",
  "completed"
] as const;

export const industries = [
  "Manufacturing",
  "Automotive",
  "Healthcare",
  "Energy",
  "Aerospace",
  "Chemicals",
  "Technology",
  "Financial Services",
  "Retail",
  "Other"
] as const;

export const companyTypes = [
  "STARTUP",
  "SME",
  "MNC",
  "ENTERPRISE",
  "CORPORATION",
  "LLC",
  "PARTNERSHIP",
  "SOLE_PROPRIETORSHIP",
  "NON_PROFIT",
  "GOVERNMENT",
  "PUBLIC_COMPANY",
  "PRIVATE_COMPANY",
  "UNICORN",
  "SCALE_UP",
  "FAMILY_BUSINESS",
  "COOPERATIVE",
  "JOINT_VENTURE",
  "SUBSIDIARY",
  "HOLDING_COMPANY",
  "CONSULTANCY",
  "FREELANCER",
  "OTHER"
] as const;
