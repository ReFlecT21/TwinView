import { router } from '../trpc';
import { companiesRouter } from './companies';
import { activityLogsRouter } from './activityLogs';
import { teamMembersRouter } from './teamMembers';
import { analyticsRouter } from './analytics';

export const appRouter = router({
  companies: companiesRouter,
  activityLogs: activityLogsRouter,
  teamMembers: teamMembersRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;