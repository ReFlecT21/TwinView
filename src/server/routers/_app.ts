import { router } from '../trpc';
import { companiesRouter } from './companies';
import { activityLogsRouter } from './activityLogs';
import { teamMembersRouter } from './teamMembers';
import { analyticsRouter } from './analytics';
import { isvStartupsRouter } from './isvStartups';

export const appRouter = router({
  companies: companiesRouter,
  activityLogs: activityLogsRouter,
  teamMembers: teamMembersRouter,
  analytics: analyticsRouter,
  isvStartups: isvStartupsRouter,
});

export type AppRouter = typeof appRouter;