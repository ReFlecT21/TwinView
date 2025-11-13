import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { ValueChainStage, DellProductCategory } from '@prisma/client';

export const dellProductsRouter = router({
  // Get all Dell products
  getAll: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(DellProductCategory).optional(),
        valueChainStage: z.nativeEnum(ValueChainStage).optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const products = await ctx.prisma.dellProduct.findMany({
          where: {
            ...(input?.category && { category: input.category }),
            ...(input?.valueChainStage && { valueChainStage: input.valueChainStage }),
            ...(input?.isActive !== undefined && { isActive: input.isActive }),
          },
          orderBy: [
            { valueChainStage: 'asc' },
            { category: 'asc' },
            { name: 'asc' }
          ],
          include: {
            _count: {
              select: {
                companyProducts: true,
                isvProducts: true,
              }
            }
          }
        });

        return products;
      } catch (error) {
        console.error('Error fetching Dell products:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Dell products',
        });
      }
    }),

  // Get Dell product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const product = await ctx.prisma.dellProduct.findUnique({
          where: { id: input.id },
          include: {
            companyProducts: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    industry: true,
                    digitalTwinStatus: true,
                  }
                }
              }
            },
            isvProducts: {
              include: {
                isv: {
                  select: {
                    id: true,
                    name: true,
                    vertical: true,
                    maturityStage: true,
                  }
                }
              }
            }
          }
        });

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Dell product not found',
          });
        }

        return product;
      } catch (error) {
        console.error('Error fetching Dell product:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Dell product',
        });
      }
    }),

  // Get products grouped by value chain stage
  getByValueChain: publicProcedure.query(async ({ ctx }) => {
    try {
      const stages = Object.values(ValueChainStage);
      const productsByStage = await Promise.all(
        stages.map(async (stage) => {
          const products = await ctx.prisma.dellProduct.findMany({
            where: { valueChainStage: stage, isActive: true },
            select: {
              id: true,
              name: true,
              category: true,
              description: true,
              _count: {
                select: {
                  companyProducts: true,
                  isvProducts: true,
                }
              }
            },
            orderBy: { name: 'asc' }
          });

          return {
            stage,
            products,
            totalCompanies: products.reduce((sum, p) => sum + p._count.companyProducts, 0),
            totalISVs: products.reduce((sum, p) => sum + p._count.isvProducts, 0),
          };
        })
      );

      return productsByStage;
    } catch (error) {
      console.error('Error fetching products by value chain:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch products by value chain',
      });
    }
  }),

  // Link a Dell product to a company
  linkToCompany: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        dellProductId: z.string(),
        adoptionStatus: z.string().optional(),
        usageScale: z.string().optional(),
        satisfaction: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if link already exists
        const existing = await ctx.prisma.companyDellProduct.findUnique({
          where: {
            companyId_dellProductId: {
              companyId: input.companyId,
              dellProductId: input.dellProductId,
            }
          }
        });

        if (existing) {
          // Update existing link
          return await ctx.prisma.companyDellProduct.update({
            where: { id: existing.id },
            data: {
              adoptionStatus: input.adoptionStatus,
              usageScale: input.usageScale,
              satisfaction: input.satisfaction,
              notes: input.notes,
              adoptionDate: input.adoptionStatus === 'deployed' || input.adoptionStatus === 'production'
                ? new Date()
                : undefined,
            }
          });
        }

        // Create new link
        return await ctx.prisma.companyDellProduct.create({
          data: {
            companyId: input.companyId,
            dellProductId: input.dellProductId,
            adoptionStatus: input.adoptionStatus || 'evaluating',
            usageScale: input.usageScale,
            satisfaction: input.satisfaction,
            notes: input.notes,
            adoptionDate: input.adoptionStatus === 'deployed' || input.adoptionStatus === 'production'
              ? new Date()
              : undefined,
          }
        });
      } catch (error) {
        console.error('Error linking Dell product to company:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to link Dell product to company',
        });
      }
    }),

  // Link a Dell product to an ISV
  linkToISV: publicProcedure
    .input(
      z.object({
        isvId: z.string(),
        dellProductId: z.string(),
        integrationType: z.string().optional(),
        integrationLevel: z.string().optional(),
        apiSupport: z.boolean().optional(),
        documentation: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if link already exists
        const existing = await ctx.prisma.iSVDellProduct.findUnique({
          where: {
            isvId_dellProductId: {
              isvId: input.isvId,
              dellProductId: input.dellProductId,
            }
          }
        });

        if (existing) {
          // Update existing link
          return await ctx.prisma.iSVDellProduct.update({
            where: { id: existing.id },
            data: {
              integrationType: input.integrationType,
              integrationLevel: input.integrationLevel,
              apiSupport: input.apiSupport,
              documentation: input.documentation,
              notes: input.notes,
              certificationDate: input.integrationType === 'certified' || input.integrationType === 'optimized'
                ? new Date()
                : undefined,
            }
          });
        }

        // Create new link
        return await ctx.prisma.iSVDellProduct.create({
          data: {
            isvId: input.isvId,
            dellProductId: input.dellProductId,
            integrationType: input.integrationType || 'compatible',
            integrationLevel: input.integrationLevel,
            apiSupport: input.apiSupport || false,
            documentation: input.documentation,
            notes: input.notes,
            certificationDate: input.integrationType === 'certified' || input.integrationType === 'optimized'
              ? new Date()
              : undefined,
          }
        });
      } catch (error) {
        console.error('Error linking Dell product to ISV:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to link Dell product to ISV',
        });
      }
    }),

  // Get value chain coverage statistics
  getValueChainStats: publicProcedure.query(async ({ ctx }) => {
    try {
      // Get company counts by value chain stage
      const companies = await ctx.prisma.company.findMany({
        select: {
          valueChainStages: true,
          primaryValueChainStage: true,
        }
      });

      // Get ISV counts by value chain stage
      const isvs = await ctx.prisma.iSVStartup.findMany({
        select: {
          valueChainStages: true,
          primaryValueChainStage: true,
        }
      });

      // Calculate statistics for each stage
      const stages = Object.values(ValueChainStage);
      const stageStats = stages.map(stage => {
        const companiesInStage = companies.filter(c => c.valueChainStages?.includes(stage)).length;
        const isvsInStage = isvs.filter(i => i.valueChainStages?.includes(stage)).length;
        const primaryCompanies = companies.filter(c => c.primaryValueChainStage === stage).length;
        const primaryISVs = isvs.filter(i => i.primaryValueChainStage === stage).length;

        return {
          stage,
          totalPartners: companiesInStage + isvsInStage,
          companies: companiesInStage,
          isvs: isvsInStage,
          primaryFocus: primaryCompanies + primaryISVs,
        };
      });

      // Calculate overall coverage
      const totalCompanies = companies.length;
      const totalISVs = isvs.length;
      const companiesWithStages = companies.filter(c => c.valueChainStages?.length > 0).length;
      const isvsWithStages = isvs.filter(i => i.valueChainStages?.length > 0).length;

      return {
        stageStats,
        overall: {
          totalPartners: totalCompanies + totalISVs,
          withValueChain: companiesWithStages + isvsWithStages,
          coveragePercentage: totalCompanies + totalISVs > 0
            ? Math.round(((companiesWithStages + isvsWithStages) / (totalCompanies + totalISVs)) * 100)
            : 0,
        },
        gaps: stageStats
          .filter(s => s.totalPartners < 5) // Stages with less than 5 partners are considered gaps
          .map(s => s.stage),
      };
    } catch (error) {
      console.error('Error fetching value chain statistics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch value chain statistics',
      });
    }
  }),
});