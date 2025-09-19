import { router, publicProcedure } from '../trpc';

export const analyticsRouter = router({
  getOverview: publicProcedure
    .query(async ({ ctx }) => {
      // Get all companies with basic stats
      const companies = await ctx.prisma.company.findMany();

      // Calculate analytics
      const totalPartners = companies.length;

      // Status distribution
      const statusDistribution = companies.reduce((acc, company) => {
        acc[company.digitalTwinStatus] = (acc[company.digitalTwinStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Industry distribution
      const industryDistribution = companies.reduce((acc, company) => {
        acc[company.industry] = (acc[company.industry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Active projects (implementing + completed status)
      const activeProjects = companies.filter(c =>
        c.digitalTwinStatus === 'implementing' || c.digitalTwinStatus === 'completed'
      ).length;

      // High opportunity partners (score >= 80)
      const highOpportunityCount = companies.filter(c => c.opportunityScore >= 80).length;

      // Total pipeline value
      const pipelineValue = companies.reduce((sum, company) => {
        const value = parseFloat(company.estimatedDealValue?.replace(/[^0-9.-]+/g, '') || '0');
        return sum + value;
      }, 0);

      // Format pipeline value
      const formattedPipelineValue = pipelineValue > 1000000
        ? `$${(pipelineValue / 1000000).toFixed(1)}M`
        : pipelineValue > 1000
        ? `$${(pipelineValue / 1000).toFixed(0)}K`
        : `$${pipelineValue.toFixed(0)}`;

      return {
        totalPartners,
        activeProjects,
        highOpportunityCount,
        pipelineValue: formattedPipelineValue,
        statusDistribution,
        industryDistribution,
      };
    }),
});