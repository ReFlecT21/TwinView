import { initTRPC } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getAuth } from '@clerk/nextjs/server';
import superjson from 'superjson';
import { prisma } from './prisma';

export const createTRPCContext = (opts: CreateNextContextOptions) => {
  const auth = getAuth(opts.req);

  return {
    prisma,
    req: opts.req,
    res: opts.res,
    auth,
    userId: auth.userId,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Helper function to get current user info for activity logging
export const getCurrentUserInfo = async (ctx: Context) => {
  if (!ctx.userId) {
    return { userId: 'system', userName: 'System' };
  }

  // Try to find the user in team members table by ID (which is now the Clerk user ID)
  const teamMember = await ctx.prisma.teamMember.findUnique({
    where: {
      id: ctx.userId
    }
  });

  if (teamMember) {
    return { userId: ctx.userId, userName: teamMember.name };
  }

  // If not found in team members, use Clerk session data
  const sessionClaims = ctx.auth.sessionClaims;
  const userName = sessionClaims?.firstName && sessionClaims?.lastName
    ? `${sessionClaims.firstName} ${sessionClaims.lastName}`
    : sessionClaims?.email || 'Unknown User';

  return { userId: ctx.userId, userName: userName as string };
};