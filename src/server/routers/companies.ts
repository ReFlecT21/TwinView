import { z } from 'zod';
import { router, publicProcedure, getCurrentUserInfo } from '../trpc';
import { generateCompetitiveAnalysis, generateOpportunityAssessment, generateDigitalTwinStrategy } from '../openai';

const createCompanySchema = z.object({
  name: z.string(),
  industry: z.string(),
  country: z.string(),
  employees: z.number().optional(),
  revenue: z.string().optional(),
  headquarters: z.string().optional(),
  ceo: z.string().optional(),
  founded: z.number().optional(),
  website: z.string().optional(),
  businessAreas: z.array(z.string()).default([]),
  digitalTwinStatus: z.enum(['not_started', 'researching', 'implementing', 'completed']).default('not_started'),
  digitalTwinMaturity: z.number().min(0).max(100).default(0),
  opportunityScore: z.number().default(0),
  estimatedDealValue: z.string().optional(),
  notes: z.string().optional(),
  competitiveAnalysis: z.string().optional(),
  dellOpportunity: z.string().optional(),
  digitalTwinStrategy: z.string().optional(),
  // Structured components
  painPoints: z.array(z.object({title: z.string(), description: z.string()})).default([]),
  dellSolutions: z.array(z.object({title: z.string(), description: z.string()})).default([]),
  nextSteps: z.array(z.object({title: z.string(), description: z.string()})).default([]),
  competitors: z.array(z.object({title: z.string(), description: z.string()})).default([]),
  dellAdvantages: z.array(z.object({title: z.string(), description: z.string()})).default([]),
  threats: z.array(z.object({title: z.string(), description: z.string()})).default([]),
  differentiation: z.array(z.object({title: z.string(), description: z.string()})).default([]),
  winStrategy: z.array(z.object({title: z.string(), description: z.string()})).default([]),
});

export const companiesRouter = router({
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      industry: z.string().optional(),
      digitalTwinStatus: z.string().optional(),
      country: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { industry: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input?.industry) where.industry = input.industry;
      if (input?.digitalTwinStatus) where.digitalTwinStatus = input.digitalTwinStatus;
      if (input?.country) where.country = input.country;

      return ctx.prisma.company.findMany({
        where,
        include: { activityLogs: true },
        orderBy: { lastUpdated: 'desc' },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.company.findUnique({
        where: { id: input.id },
        include: { activityLogs: true },
      });
    }),

  create: publicProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.create({
        data: input,
        include: { activityLogs: true },
      });

      // Get current user info for activity logging
      const userInfo = await getCurrentUserInfo(ctx);

      // Create activity log
      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: userInfo.userId,
          userName: userInfo.userName,
          action: 'company_created',
          description: `Added new company: ${company.name}`,
        },
      });

      return company;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      data: createCompanySchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Debug logging
      console.log('Update input received:', JSON.stringify(input, null, 2));
      console.log('Data to update:', input.data);

      const company = await ctx.prisma.company.update({
        where: { id: input.id },
        data: input.data,
        include: { activityLogs: true },
      });

      // Get current user info for activity logging
      const userInfo = await getCurrentUserInfo(ctx);

      // Create activity log
      const changedFields = Object.keys(input.data);
      console.log('Changed fields:', changedFields);

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: userInfo.userId,
          userName: userInfo.userName,
          action: 'company_updated',
          description: `Updated ${changedFields.join(', ')} for ${company.name}`,
        },
      });

      console.log('Updated company:', company);
      return company;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.company.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  generateCompetitiveAnalysis: publicProcedure
    .input(z.object({
      id: z.string(),
      companyName: z.string(),
      industry: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // First get the company to access digitalTwinStatus
      const existingCompany = await ctx.prisma.company.findUnique({
        where: { id: input.id }
      });

      if (!existingCompany) {
        throw new Error('Company not found');
      }

      const analysis = await generateCompetitiveAnalysis(
        input.companyName,
        input.industry,
        existingCompany.digitalTwinStatus
      );

      const company = await ctx.prisma.company.update({
        where: { id: input.id },
        data: { competitiveAnalysis: analysis },
        include: { activityLogs: true },
      });

      // Get current user info but still show as AI System for clarity
      const userInfo = await getCurrentUserInfo(ctx);

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: userInfo.userId,
          userName: `AI System (requested by ${userInfo.userName})`,
          action: 'ai_analysis_generated',
          description: `Generated competitive analysis for ${company.name}`,
        },
      });

      return { analysis, company };
    }),

  generateOpportunityAssessment: publicProcedure
    .input(z.object({
      id: z.string(),
      companyName: z.string(),
      industry: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // First get the company to access revenue, digitalTwinMaturity, and employees
      const existingCompany = await ctx.prisma.company.findUnique({
        where: { id: input.id }
      });

      if (!existingCompany) {
        throw new Error('Company not found');
      }

      const assessmentResult = await generateOpportunityAssessment(
        input.companyName,
        input.industry,
        existingCompany.revenue || '0',
        existingCompany.digitalTwinMaturity || 0,
        existingCompany.employees || undefined
      );

      const company = await ctx.prisma.company.update({
        where: { id: input.id },
        data: {
          dellOpportunity: assessmentResult.assessmentNotes,
          opportunityScore: assessmentResult.opportunityScore,
          estimatedDealValue: assessmentResult.estimatedDealValue,
          painPoints: assessmentResult.painPoints,
          dellSolutions: assessmentResult.dellSolutions,
          nextSteps: assessmentResult.nextSteps
        },
        include: { activityLogs: true },
      });

      // Get current user info but still show as AI System for clarity
      const userInfo = await getCurrentUserInfo(ctx);

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: userInfo.userId,
          userName: `AI System (requested by ${userInfo.userName})`,
          action: 'ai_opportunity_generated',
          description: `Generated comprehensive Dell opportunity assessment with structured data for ${company.name}`,
        },
      });

      return { assessment: assessmentResult, company };
    }),

  generateDigitalTwinStrategy: publicProcedure
    .input(z.object({
      id: z.string(),
      companyName: z.string(),
      industry: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // First fetch the company to get business areas and employee count
      const existingCompany = await ctx.prisma.company.findUnique({
        where: { id: input.id }
      });

      if (!existingCompany) {
        throw new Error('Company not found');
      }

      const strategyResult = await generateDigitalTwinStrategy(
        input.companyName,
        input.industry,
        existingCompany.businessAreas || [],
        existingCompany.employees || undefined
      );

      // Create recommendations data structure for database storage
      const recommendationsData = strategyResult.recommendations.map(rec => ({
        title: rec.title,
        description: rec.description
      }));

      const company = await ctx.prisma.company.update({
        where: { id: input.id },
        data: {
          digitalTwinStrategy: strategyResult.strategyAnalysis,
          digitalTwinMaturity: strategyResult.maturityScore,
          digitalTwinStatus: strategyResult.status,
          businessAreas: strategyResult.keyInitiatives,
          // Store recommendations in the notes field for now (could add a dedicated field later)
          notes: JSON.stringify(recommendationsData)
        },
        include: { activityLogs: true },
      });

      // Get current user info but still show as AI System for clarity
      const userInfo = await getCurrentUserInfo(ctx);

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: userInfo.userId,
          userName: `AI System (requested by ${userInfo.userName})`,
          action: 'ai_strategy_generated',
          description: `Generated comprehensive digital twin strategy with structured data for ${company.name}`,
        },
      });

      return { strategy: strategyResult, company };
    }),
});