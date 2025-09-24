import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getCurrentUserInfo } from '../trpc';

const createTeamMemberSchema = z.object({
  id: z.string(), // Required since it's the primary key (Clerk user ID)
  name: z.string(),
  email: z.string().email(),
  role: z.string().optional(),
  department: z.string().optional(),
});

const addNewUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  clerkUserId: z.string(), // Now required since it's the primary key
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

  addNewUser: publicProcedure
    .input(addNewUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, clerkUserId } = input;
      const fullName = `${firstName} ${lastName}`;

      // Check if user already exists by ID (Clerk user ID)
      const existingUser = await ctx.prisma.teamMember.findUnique({
        where: { id: clerkUserId },
      });

      if (existingUser) {
        return existingUser;
      }

      // Create new team member with Clerk user ID as primary key
      return ctx.prisma.teamMember.create({
        data: {
          id: clerkUserId, // Use Clerk user ID as primary key
          name: fullName,
          email,
          role: null, // Role is optional, will be null initially
        },
      });
    }),
});