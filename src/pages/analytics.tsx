import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.getOverview.useQuery();
  const { data: companies = [], isLoading: companiesLoading } = trpc.companies.getAll.useQuery({});

  // Prepare chart data
  const statusData = analytics ? Object.entries(analytics.statusDistribution).map(([status, count]) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  })) : [];

  const industryData = analytics ? Object.entries(analytics.industryDistribution).map(([industry, count]) => ({
    name: industry,
    value: count,
  })) : [];

  // Opportunity score distribution
  const opportunityDistribution = companies.reduce((acc: any, company: any) => {
    const score = company.opportunityScore;
    const range = score >= 80 ? 'High (80-100)' : score >= 50 ? 'Medium (50-79)' : 'Low (0-49)';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {});

  const opportunityData = Object.entries(opportunityDistribution).map(([range, count]) => ({
    name: range,
    value: count,
  }));

  // Maturity vs Opportunity scatter data
  const maturityOpportunityData = companies.map((company: any) => ({
    maturity: company.digitalTwinMaturity,
    opportunity: company.opportunityScore,
    name: company.name,
  }));

  const handleExportReport = () => {
    console.log("Export analytics report clicked");
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Analytics"
        description="Insights and trends from digital twin partner intelligence data"
        onExportReport={handleExportReport}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Key Metrics */}
        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="text-2xl font-bold text-card-foreground" data-testid="metric-total-partners">
                {analytics.totalPartners}
              </div>
              <p className="text-sm text-muted-foreground">Total Partners</p>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-card-foreground" data-testid="metric-active-projects">
                {analytics.activeProjects}
              </div>
              <p className="text-sm text-muted-foreground">Active Digital Twin Projects</p>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-card-foreground" data-testid="metric-high-opportunity">
                {analytics.highOpportunityCount}
              </div>
              <p className="text-sm text-muted-foreground">High Opportunity Partners</p>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-card-foreground" data-testid="metric-pipeline-value">
                {analytics.pipelineValue}
              </div>
              <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
            </Card>
          </div>
        ) : null}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Digital Twin Status Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Digital Twin Status Distribution</h3>
            {analyticsLoading || companiesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Industry Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Industry Distribution</h3>
            {analyticsLoading || companiesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={industryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Opportunity Score Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Opportunity Score Distribution</h3>
            {companiesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={opportunityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Maturity vs Opportunity Correlation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Digital Twin Maturity vs Opportunity Score</h3>
            {companiesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={maturityOpportunityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="maturity" 
                    type="number" 
                    domain={[0, 100]}
                    label={{ value: 'Digital Twin Maturity (%)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    dataKey="opportunity"
                    type="number"
                    domain={[0, 100]}
                    label={{ value: 'Opportunity Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={() => ''}
                    formatter={(value, name, props) => [
                      `${name}: ${value}`,
                      props.payload.name
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="opportunity" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
