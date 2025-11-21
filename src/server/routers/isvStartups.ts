import { z } from 'zod';
import { router, publicProcedure, getCurrentUserInfo } from '../trpc';
import { isvVerticals, isvSizes, isvInterestLevels, isvMaturityStages, isvRegions, ValueChainStage } from '@shared/schema';

const createISVSchema = z.object({
  name: z.string(),
  vertical: z.enum(isvVerticals),
  headquarters: z.string().optional(),
  presence: z.array(z.string()).default([]),
  regions: z.array(z.enum(isvRegions)).default([]),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  size: z.enum(isvSizes).optional(),
  maturityStage: z.enum(isvMaturityStages).optional(),
  employees: z.number().optional(),
  accounts: z.number().optional(),
  revenue: z.string().optional(),
  hasOpenAPIs: z.boolean().default(false),
  integrations: z.array(z.string()).default([]),
  dellValidated: z.boolean().default(false),
  consortiumMemberships: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  interestLevel: z.enum(isvInterestLevels).optional(),
  interestReasons: z.array(z.string()).default([]),
  caseStudies: z.array(z.object({
    title: z.string(),
    location: z.string(),
    description: z.string(),
  })).default([]),
  strategicValue: z.string().optional(),
  collaborationTypes: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const isvStartupsRouter = router({
  getAll: publicProcedure
    .input(z.object({
      vertical: z.enum(isvVerticals).optional(),
      size: z.enum(isvSizes).optional(),
      interestLevel: z.enum(isvInterestLevels).optional(),
      region: z.enum(isvRegions).optional(),
      search: z.string().optional(),
      valueChainStages: z.array(z.nativeEnum(ValueChainStage)).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.vertical) where.vertical = input.vertical;
      if (input?.size) where.size = input.size;
      if (input?.interestLevel) where.interestLevel = input.interestLevel;
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { headquarters: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      // Filter by value chain stages - ISVs that have ANY of the selected stages
      if (input?.valueChainStages && input.valueChainStages.length > 0) {
        where.valueChainStages = {
          hasSome: input.valueChainStages,
        };
      }

      return ctx.prisma.iSVStartup.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.iSVStartup.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(createISVSchema)
    .mutation(async ({ ctx, input }) => {
      const userInfo = await getCurrentUserInfo(ctx);

      const isvStartup = await ctx.prisma.iSVStartup.create({
        data: input,
      });

      // Log activity
      await ctx.prisma.activityLog.create({
        data: {
          userId: userInfo.userId,
          userName: userInfo.userName,
          action: 'isv_created',
          description: `Added new ISV/Startup: ${isvStartup.name}`,
        },
      });

      return isvStartup;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      data: createISVSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userInfo = await getCurrentUserInfo(ctx);

      const isvStartup = await ctx.prisma.iSVStartup.update({
        where: { id: input.id },
        data: {
          ...input.data,
          updatedAt: new Date(),
        },
      });

      // Log activity
      await ctx.prisma.activityLog.create({
        data: {
          userId: userInfo.userId,
          userName: userInfo.userName,
          action: 'isv_updated',
          description: `Updated ISV/Startup: ${isvStartup.name}`,
        },
      });

      return isvStartup;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userInfo = await getCurrentUserInfo(ctx);

      const isvStartup = await ctx.prisma.iSVStartup.findUnique({
        where: { id: input.id },
      });

      if (!isvStartup) {
        throw new Error('ISV/Startup not found');
      }

      await ctx.prisma.iSVStartup.delete({
        where: { id: input.id },
      });

      // Log activity
      await ctx.prisma.activityLog.create({
        data: {
          userId: userInfo.userId,
          userName: userInfo.userName,
          action: 'isv_deleted',
          description: `Deleted ISV/Startup: ${isvStartup.name}`,
        },
      });

      return { success: true };
    }),

  getByVertical: publicProcedure
    .query(async ({ ctx }) => {
      const manufacturing = await ctx.prisma.iSVStartup.count({
        where: { vertical: 'manufacturing' },
      });
      const smartCities = await ctx.prisma.iSVStartup.count({
        where: { vertical: 'smart_cities' },
      });
      const healthcare = await ctx.prisma.iSVStartup.count({
        where: { vertical: 'healthcare' },
      });

      return {
        manufacturing,
        smartCities,
        healthcare,
      };
    }),

  matchWithCompanies: publicProcedure
    .input(z.object({ isvId: z.string() }))
    .query(async ({ ctx, input }) => {
      const isv = await ctx.prisma.iSVStartup.findUnique({
        where: { id: input.isvId },
      });

      if (!isv) {
        throw new Error('ISV/Startup not found');
      }

      // Get all companies
      const companies = await ctx.prisma.company.findMany();

      // Calculate synergy scores based on various factors
      const matches = companies.map(company => {
        let synergyScore = 0;
        const matchReasons: string[] = [];

        // Industry alignment
        if (isv.vertical === 'manufacturing' && company.industry === 'Manufacturing') {
          synergyScore += 20;
          matchReasons.push('Industry alignment');
        }
        if (isv.vertical === 'healthcare' && company.industry === 'Healthcare') {
          synergyScore += 20;
          matchReasons.push('Industry alignment');
        }
        if (isv.vertical === 'smart_cities' && (company.industry === 'Technology' || company.industry === 'Energy')) {
          synergyScore += 15;
          matchReasons.push('Industry synergy');
        }

        // Geographic overlap
        if (isv.regions && company.country) {
          if (isv.regions.includes('APAC') && ['India', 'Singapore', 'Japan', 'China'].includes(company.country)) {
            synergyScore += 15;
            matchReasons.push('Geographic presence overlap');
          }
          if (isv.regions.includes('EMEA') && ['Germany', 'UK', 'France', 'UAE'].includes(company.country)) {
            synergyScore += 15;
            matchReasons.push('Geographic presence overlap');
          }
          if (isv.regions.includes('Americas') && ['USA', 'Canada', 'Brazil'].includes(company.country)) {
            synergyScore += 15;
            matchReasons.push('Geographic presence overlap');
          }
        }

        // Size compatibility
        if (isv.size === 'enterprise' && company.employees && company.employees > 50000) {
          synergyScore += 10;
          matchReasons.push('Enterprise scale match');
        }
        if (isv.size === 'startup' && company.type === 'STARTUP') {
          synergyScore += 10;
          matchReasons.push('Startup ecosystem alignment');
        }

        // Digital transformation readiness
        if (company.digitalTwinStatus === 'implementing' || company.digitalTwinStatus === 'completed') {
          synergyScore += 15;
          matchReasons.push('Digital transformation maturity');
        }

        // Scoring bonus
        if ((company as any).scores?.totalScore && (company as any).scores.totalScore > 4) {
          synergyScore += 20;
          matchReasons.push('High partnership score');
        }

        // Open API bonus
        if (isv.hasOpenAPIs) {
          synergyScore += 10;
          matchReasons.push('Open API integration capability');
        }

        // Dell validation bonus
        if (isv.dellValidated) {
          synergyScore += 15;
          matchReasons.push('Dell validated solution');
        }

        return {
          company,
          synergyScore: Math.min(synergyScore, 100), // Cap at 100
          matchReasons,
        };
      });

      // Sort by synergy score and return top matches
      return matches
        .sort((a, b) => b.synergyScore - a.synergyScore)
        .slice(0, 10); // Return top 10 matches
    }),

  updateMatchedPartners: publicProcedure
    .input(z.object({
      isvId: z.string(),
      companyIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const userInfo = await getCurrentUserInfo(ctx);

      const isvStartup = await ctx.prisma.iSVStartup.update({
        where: { id: input.isvId },
        data: {
          matchedPartners: input.companyIds,
          updatedAt: new Date(),
        },
      });

      // Log activity
      await ctx.prisma.activityLog.create({
        data: {
          userId: userInfo.userId,
          userName: userInfo.userName,
          action: 'isv_partners_matched',
          description: `Updated partner matches for ISV: ${isvStartup.name}`,
        },
      });

      return isvStartup;
    }),
});