import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

const createTeamMemberSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  department: z.string().optional(),
});

export const teamMembersRouter = router({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.teamMember.findMany({
        orderBy: { joinedAt: 'desc' },
      });
    }),

  create: publicProcedure
    .input(createTeamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.create({
        data: input,
      });
    }),
});