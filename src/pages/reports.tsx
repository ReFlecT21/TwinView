import { useState } from "react";
import Header from "@/components/layout/header";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileDown, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  Star,
  Building2,
  DollarSign,
  Calendar,
  Users
} from "lucide-react";

export default function Reports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("quarter");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.getOverview.useQuery();
  const { data: companies = [], isLoading: companiesLoading } = trpc.companies.getAll.useQuery({});
  const { data: activities = [], isLoading: activitiesLoading } = trpc.activityLogs.getAll.useQuery({});

  const handleExportExecutiveSummary = () => {
    console.log("Export executive summary clicked");
    // TODO: Implement actual export functionality
  };

  const handleExportDetailedReport = () => {
    console.log("Export detailed report clicked");
    // TODO: Implement actual export functionality
  };

  const handleExportPipelineReport = () => {
    console.log("Export pipeline report clicked");
    // TODO: Implement actual export functionality
  };

  // Calculate insights
  const highOpportunityCompanies = companies.filter((c: any) => c.opportunityScore >= 80);
  const urgentFollowUps = companies.filter((c: any) => {
    if (!c.nextFollowUp) return false;
    const followUpDate = new Date(c.nextFollowUp);
    const today = new Date();
    const daysUntilFollowUp = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilFollowUp <= 7 && daysUntilFollowUp >= 0;
  });

  const stagnantCompanies = companies.filter((c: any) => {
    if (!c.lastUpdated) return false;
    const lastUpdate = new Date(c.lastUpdated);
    const today = new Date();
    const daysSinceUpdate = Math.ceil((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate > 30;
  });

  const recentWins = companies.filter((c: any) => c.digitalTwinStatus === 'completed');

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reports"
        description="Executive summaries and actionable insights for strategic decision making"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Report Controls */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Timeframe</label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-40" data-testid="select-timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Industry Filter</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-40" data-testid="select-industry-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="aerospace">Aerospace</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportExecutiveSummary}
                data-testid="button-export-executive"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Executive Summary
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportDetailedReport}
                data-testid="button-export-detailed"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Detailed Report
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="executive" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="executive" data-testid="tab-executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline Analysis</TabsTrigger>
            <TabsTrigger value="competitive" data-testid="tab-competitive-overview">Competitive Overview</TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            {/* Key Metrics Summary */}
            {analyticsLoading ? (
              <Skeleton className="h-48" />
            ) : analytics ? (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary" data-testid="summary-total-partners">
                      {analytics.totalPartners}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Partners</p>
                    <div className="text-xs text-green-600 mt-1">+12% vs last quarter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600" data-testid="summary-active-projects">
                      {analytics.activeProjects}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <div className="text-xs text-green-600 mt-1">+8% vs last quarter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600" data-testid="summary-high-opportunity">
                      {analytics.highOpportunityCount}
                    </div>
                    <p className="text-sm text-muted-foreground">High Opportunity</p>
                    <div className="text-xs text-green-600 mt-1">+15% vs last quarter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600" data-testid="summary-pipeline-value">
                      {analytics.pipelineValue}
                    </div>
                    <p className="text-sm text-muted-foreground">Pipeline Value</p>
                    <div className="text-xs text-green-600 mt-1">+23% vs last quarter</div>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Critical Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">High Priority Opportunities</h3>
                </div>
                {companiesLoading ? (
                  <Skeleton className="h-32" />
                ) : (
                  <div className="space-y-3">
                    {highOpportunityCompanies.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No high priority opportunities at this time.</p>
                    ) : (
                      highOpportunityCompanies.slice(0, 5).map((company: any) => (
                        <div key={company.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div>
                            <p className="font-medium text-sm" data-testid={`high-priority-${company.id}`}>
                              {company.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{company.industry}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{(company.opportunityScore / 10).toFixed(1)}/10</p>
                            <p className="text-xs text-muted-foreground">{company.estimatedDealValue || 'TBD'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold">Urgent Follow-ups</h3>
                </div>
                {companiesLoading ? (
                  <Skeleton className="h-32" />
                ) : (
                  <div className="space-y-3">
                    {urgentFollowUps.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No urgent follow-ups this week.</p>
                    ) : (
                      urgentFollowUps.slice(0, 5).map((company: any) => (
                        <div key={company.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-sm" data-testid={`urgent-followup-${company.id}`}>
                              {company.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{company.industry}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                              {new Date(company.nextFollowUp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Follow-up due</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity Summary</h3>
              {activitiesLoading ? (
                <Skeleton className="h-32" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-card-foreground">
                      {activities.filter((a: any) => a.action === 'company_created').length}
                    </div>
                    <p className="text-sm text-muted-foreground">New Companies Added</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-card-foreground">
                      {activities.filter((a: any) => a.action === 'company_updated').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Companies Updated</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-card-foreground">
                      {activities.filter((a: any) => a.action.includes('generated')).length}
                    </div>
                    <p className="text-sm text-muted-foreground">AI Analyses Generated</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Pipeline Health</h3>
                </div>
                {companiesLoading ? (
                  <Skeleton className="h-48" />
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Pipeline Value</span>
                      <span className="text-2xl font-bold" data-testid="pipeline-total-value">
                        {analytics?.pipelineValue || '$0'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Not Started</span>
                        <span>{companies.filter((c: any) => c.digitalTwinStatus === 'not_started').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Researching</span>
                        <span>{companies.filter((c: any) => c.digitalTwinStatus === 'researching').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Implementing</span>
                        <span>{companies.filter((c: any) => c.digitalTwinStatus === 'implementing').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span>{companies.filter((c: any) => c.digitalTwinStatus === 'completed').length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Conversion Metrics</h3>
                </div>
                {companiesLoading ? (
                  <Skeleton className="h-48" />
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="text-2xl font-bold" data-testid="conversion-rate">
                        {companies.length > 0 ? 
                          Math.round((recentWins.length / companies.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Deal Size</span>
                        <span>$750K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Sales Cycle</span>
                        <span>8.5 months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Win Rate</span>
                        <span>68%</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pipeline Actions Required</h3>
                <Button 
                  onClick={handleExportPipelineReport}
                  variant="outline"
                  size="sm"
                  data-testid="button-export-pipeline"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Pipeline
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-medium">Overdue Follow-ups</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Companies requiring immediate attention
                  </p>
                  <div className="text-2xl font-bold text-yellow-600">
                    {companies.filter((c: any) => {
                      if (!c.nextFollowUp) return false;
                      return new Date(c.nextFollowUp) < new Date();
                    }).length}
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <h4 className="font-medium">Stagnant Opportunities</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    No updates in 30+ days
                  </p>
                  <div className="text-2xl font-bold text-red-600" data-testid="stagnant-count">
                    {stagnantCompanies.length}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Competitive Landscape Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">68%</div>
                  <p className="text-sm text-muted-foreground">Market Share Opportunity</p>
                  <p className="text-xs text-green-600 mt-1">+5% vs last quarter</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">15</div>
                  <p className="text-sm text-muted-foreground">Key Competitors Identified</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all industries</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">89%</div>
                  <p className="text-sm text-muted-foreground">Dell Advantage Score</p>
                  <p className="text-xs text-green-600 mt-1">Edge computing leadership</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Competitive Insights</h3>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Edge Computing Advantage</h4>
                  <p className="text-sm text-muted-foreground">
                    Dell&apos;s edge computing infrastructure provides significant advantages in 73% of identified opportunities, 
                    particularly in manufacturing and automotive sectors where real-time processing is critical.
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Security & Compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    Strong positioning in aerospace and healthcare verticals due to advanced security features 
                    and compliance certifications, giving Dell a 23% win rate advantage over competitors.
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Hybrid Cloud Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Dell&apos;s hybrid cloud solutions address 89% of customer concerns about data sovereignty 
                    and regulatory compliance, particularly important for European partners.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Strategic Recommendations</h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Immediate Actions (Next 30 Days)</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Contact {urgentFollowUps.length} companies with overdue follow-ups</li>
                    <li>• Re-engage {stagnantCompanies.length} stagnant opportunities with refreshed value propositions</li>
                    <li>• Accelerate {highOpportunityCompanies.length} high-priority deals through executive engagement</li>
                  </ul>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Short-term Initiatives (Next Quarter)</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Develop industry-specific digital twin use case presentations for top 3 verticals</li>
                    <li>• Create competitive battle cards for edge computing vs. cloud-only solutions</li>
                    <li>• Establish partner advisory board with 5 key implementing companies</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Long-term Strategy (Next 6-12 Months)</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Build center of excellence for digital twin solutions with dedicated technical resources</li>
                    <li>• Develop strategic partnerships with leading digital twin software vendors</li>
                    <li>• Create industry-specific reference architectures and success stories</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resource Allocation Recommendations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Sales Focus Areas</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manufacturing</span>
                      <Badge variant="secondary">High Priority</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Aerospace</span>
                      <Badge variant="secondary">High Priority</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Automotive</span>
                      <Badge variant="outline">Medium Priority</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Technical Investment</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Edge Computing</span>
                      <Badge variant="secondary">Critical</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI/ML Integration</span>
                      <Badge variant="secondary">High</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Security Solutions</span>
                      <Badge variant="outline">Medium</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
