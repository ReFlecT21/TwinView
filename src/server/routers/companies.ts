import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
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
  digitalTwinStatus: z.string().default('not_started'),
  digitalTwinMaturity: z.number().default(0),
  opportunityScore: z.number().default(0),
  estimatedDealValue: z.string().optional(),
  notes: z.string().optional(),
  competitiveAnalysis: z.string().optional(),
  dellOpportunity: z.string().optional(),
  digitalTwinStrategy: z.string().optional(),
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

      // Create activity log
      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: 'system',
          userName: 'System',
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

      // Create activity log
      const changedFields = Object.keys(input.data);
      console.log('Changed fields:', changedFields);

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: 'system',
          userName: 'System',
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

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: 'system',
          userName: 'AI System',
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
      // First get the company to access revenue and digitalTwinMaturity
      const existingCompany = await ctx.prisma.company.findUnique({
        where: { id: input.id }
      });

      if (!existingCompany) {
        throw new Error('Company not found');
      }

      const assessment = await generateOpportunityAssessment(
        input.companyName,
        input.industry,
        existingCompany.revenue || '0',
        existingCompany.digitalTwinMaturity || 0
      );

      const company = await ctx.prisma.company.update({
        where: { id: input.id },
        data: { dellOpportunity: assessment.assessmentNotes },
        include: { activityLogs: true },
      });

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: 'system',
          userName: 'AI System',
          action: 'ai_analysis_generated',
          description: `Generated Dell opportunity assessment for ${company.name}`,
        },
      });

      return { assessment, company };
    }),

  generateDigitalTwinStrategy: publicProcedure
    .input(z.object({
      id: z.string(),
      companyName: z.string(),
      industry: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // First fetch the company to get business areas
      const existingCompany = await ctx.prisma.company.findUnique({
        where: { id: input.id }
      });

      const strategy = await generateDigitalTwinStrategy(
        input.companyName,
        input.industry,
        existingCompany?.businessAreas || []
      );

      const company = await ctx.prisma.company.update({
        where: { id: input.id },
        data: { digitalTwinStrategy: strategy },
        include: { activityLogs: true },
      });

      await ctx.prisma.activityLog.create({
        data: {
          companyId: company.id,
          userId: 'system',
          userName: 'AI System',
          action: 'ai_analysis_generated',
          description: `Generated digital twin strategy for ${company.name}`,
        },
      });

      return { strategy, company };
    }),
});