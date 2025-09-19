import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

const createActivityLogSchema = z.object({
  companyId: z.string().optional(),
  userId: z.string(),
  userName: z.string(),
  action: z.string(),
  description: z.string(),
});

export const activityLogsRouter = router({
  getAll: publicProcedure
    .input(z.object({
      companyId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.companyId ? { companyId: input.companyId } : {};

      return ctx.prisma.activityLog.findMany({
        where,
        include: { company: true },
        orderBy: { timestamp: 'desc' },
      });
    }),

  create: publicProcedure
    .input(createActivityLogSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.activityLog.create({
        data: input,
        include: { company: true },
      });
    }),
});