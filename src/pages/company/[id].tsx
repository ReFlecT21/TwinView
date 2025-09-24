import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Company } from "@shared/schema";
import { ArrowLeft, Loader2, Brain, Target, Kanban, Edit3, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

const statusColors = {
  not_started: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  researching: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  implementing: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
};

const statusLabels = {
  not_started: "Not Started",
  researching: "Researching",
  implementing: "Implementing",
  completed: "Completed"
};

function getCompanyInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getMaturityColor(maturity: number) {
  if (maturity < 30) return "bg-red-500";
  if (maturity < 60) return "bg-yellow-500";
  if (maturity < 90) return "bg-green-500";
  return "bg-blue-500";
}

export default function CompanyDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Manual editing states
  const [isEditingStrategy, setIsEditingStrategy] = useState(false);
  const [isEditingOpportunity, setIsEditingOpportunity] = useState(false);
  const [isEditingCompetitive, setIsEditingCompetitive] = useState(false);

  // Manual content states
  const [manualStrategy, setManualStrategy] = useState("");
  const [manualOpportunity, setManualOpportunity] = useState("");
  const [manualCompetitive, setManualCompetitive] = useState("");

  // Fetch company data
  const { data: company, isLoading, error } = trpc.companies.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  // Initialize manual content when company changes
  useEffect(() => {
    if (company) {
      setManualStrategy(company.digitalTwinStrategy || "");
      setManualOpportunity(company.dellOpportunity || "");
      setManualCompetitive(company.competitiveAnalysis || "");
    }
  }, [company]);

  // Update mutation for manual research fields
  const updateCompanyMutation = trpc.companies.update.useMutation({
    onSuccess: (updatedCompany) => {
      utils.companies.invalidate();
      toast({
        title: "Research Updated",
        description: "Manual research has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save research: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions to save manual research
  const saveStrategy = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { digitalTwinStrategy: manualStrategy }
    });
    setIsEditingStrategy(false);
  };

  const saveOpportunity = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { dellOpportunity: manualOpportunity }
    });
    setIsEditingOpportunity(false);
  };

  const saveCompetitive = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { competitiveAnalysis: manualCompetitive }
    });
    setIsEditingCompetitive(false);
  };

  // AI generation mutations
  const generateCompetitiveAnalysisMutation = trpc.companies.generateCompetitiveAnalysis.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      toast({
        title: "Analysis Generated",
        description: "AI competitive analysis has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate analysis: " + error.message,
        variant: "destructive",
      });
    },
  });

  const generateOpportunityAssessmentMutation = trpc.companies.generateOpportunityAssessment.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      toast({
        title: "Assessment Generated",
        description: "AI opportunity assessment has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate assessment: " + error.message,
        variant: "destructive",
      });
    },
  });

  const generateDigitalTwinStrategyMutation = trpc.companies.generateDigitalTwinStrategy.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      toast({
        title: "Strategy Generated",
        description: "AI digital twin strategy has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate strategy: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header
          title="Loading Company..."
          description="Please wait while we load the company details"
          leftAction={
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          }
        />
        <div className="flex-1 overflow-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col h-full">
        <Header
          title="Company Not Found"
          description="The requested company could not be found"
          leftAction={
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          }
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-lg mb-4">Company not found or an error occurred.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const opportunityDots = Array.from({ length: 10 }, (_, i) => (
    <div
      key={i}
      className={`w-3 h-3 rounded-full ${
        i < Math.floor(company.opportunityScore / 10)
          ? "bg-yellow-500"
          : "bg-muted"
      }`}
    />
  ));

  return (
    <div className="flex flex-col h-full">
      <Header
        title={company.name}
        description={`${company.industry} • ${company.country}${company.employees ? ` • ${company.employees.toLocaleString()} employees` : ''}`}
        leftAction={
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="flex-1 overflow-y-scroll">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Company Header */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">
                {getCompanyInitials(company.name)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                {company.name}
              </h1>
              <p className="text-muted-foreground text-lg">
                {company.industry} • {company.country}
                {company.employees && ` • ${company.employees.toLocaleString()} employees`}
              </p>
            </div>
          </div>

          {/* Status and Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Digital Twin Status</span>
                <Badge className={statusColors[company.digitalTwinStatus as keyof typeof statusColors]}>
                  {statusLabels[company.digitalTwinStatus as keyof typeof statusLabels]}
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-muted rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${getMaturityColor(company.digitalTwinMaturity)}`}
                    style={{ width: `${company.digitalTwinMaturity}%` }}
                  />
                </div>
                <span className="text-lg font-bold">{company.digitalTwinMaturity}%</span>
              </div>
            </Card>

            <Card className="p-6 bg-secondary/50">
              <div className="text-sm font-medium text-muted-foreground mb-4">Opportunity Score</div>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  {opportunityDots}
                </div>
                <span className="text-2xl font-bold">{(company.opportunityScore / 10).toFixed(1)}</span>
              </div>
            </Card>

            <Card className="p-6 bg-secondary/50">
              <div className="text-sm font-medium text-muted-foreground mb-4">Estimated Deal Value</div>
              <div className="text-3xl font-bold text-card-foreground">
                {company.estimatedDealValue || "TBD"}
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-14 p-0 bg-muted rounded-lg">
              <TabsTrigger value="overview" className="text-base py-4 px-4 data-[state=active]:bg-background rounded-md mx-1">Overview</TabsTrigger>
              <TabsTrigger value="strategy" className="text-base py-4 px-4 data-[state=active]:bg-background rounded-md mx-1">Digital Twin Kanban</TabsTrigger>
              <TabsTrigger value="dell-opportunity" className="text-base py-4 px-4 data-[state=active]:bg-background rounded-md mx-1">Dell Opportunity</TabsTrigger>
              <TabsTrigger value="competitive" className="text-base py-4 px-4 data-[state=active]:bg-background rounded-md mx-1">Competitive Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Company Information</h3>
                  <div className="space-y-4">
                    {company.revenue && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium text-lg">{company.revenue}</span>
                      </div>
                    )}
                    {company.employees && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Employees</span>
                        <span className="font-medium text-lg">{company.employees.toLocaleString()}</span>
                      </div>
                    )}
                    {company.headquarters && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Headquarters</span>
                        <span className="font-medium text-lg">{company.headquarters}</span>
                      </div>
                    )}
                    {company.ceo && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">CEO</span>
                        <span className="font-medium text-lg">{company.ceo}</span>
                      </div>
                    )}
                    {company.founded && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Founded</span>
                        <span className="font-medium text-lg">{company.founded}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Website</span>
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-lg text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Key Business Areas</h3>
                  <div className="space-y-3">
                    {company.businessAreas?.length ? (
                      company.businessAreas.map((area, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-secondary/30">
                          <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-base">{area}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No business areas specified</p>
                    )}
                  </div>
                </Card>
              </div>

              {company.notes && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Notes</h3>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-base text-card-foreground whitespace-pre-wrap leading-relaxed">{company.notes}</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="strategy" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Digital Twin Strategy</h3>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={() => generateDigitalTwinStrategyMutation.mutate({
                      id: company.id,
                      companyName: company.name,
                      industry: company.industry
                    })}
                    disabled={generateDigitalTwinStrategyMutation.isPending}
                  >
                    {generateDigitalTwinStrategyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Kanban className="w-4 h-4 mr-2" />
                    )}
                    Generate AI Strategy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Status */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    Current Status
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Digital Twin Maturity</div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getMaturityColor(company.digitalTwinMaturity)}`}
                            style={{ width: `${company.digitalTwinMaturity}%` }}
                          />
                        </div>
                        <span className="font-semibold">{company.digitalTwinMaturity}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Implementation Stage</div>
                      <Badge className={statusColors[company.digitalTwinStatus as keyof typeof statusColors]}>
                        {statusLabels[company.digitalTwinStatus as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Key Initiatives */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Key Initiatives
                  </h4>
                  <div className="space-y-3">
                    {company.businessAreas && company.businessAreas.length > 0 ? (
                      company.businessAreas.map((area, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm">{area}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic p-3 bg-secondary/30 rounded-lg">
                        No business areas specified
                      </div>
                    )}
                  </div>
                </Card>

                {/* Next Steps */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    Recommendations
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Industry Focus</div>
                      <div className="text-sm text-muted-foreground mt-1">{company.industry}-specific solutions</div>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Scale Factor</div>
                      <div className="text-sm text-muted-foreground mt-1">{company.employees ? `${company.employees.toLocaleString()} employee` : 'Enterprise'} implementation</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Detailed Strategy Analysis</h4>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingStrategy(!isEditingStrategy)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingStrategy ? 'Cancel Edit' : 'Edit Analysis'}
                  </Button>
                </div>

                {isEditingStrategy ? (
                  <div className="space-y-4">
                    <Textarea
                      value={manualStrategy}
                      onChange={(e) => setManualStrategy(e.target.value)}
                      placeholder="Enter detailed digital twin strategy analysis..."
                      className="min-h-[300px] resize-none text-base leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={saveStrategy}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Analysis
                      </Button>
                    </div>
                  </div>
                ) : (company.digitalTwinStrategy || manualStrategy) ? (
                  <div className="prose prose-base max-w-none">
                    <div className="text-base whitespace-pre-wrap leading-relaxed p-4 bg-secondary/20 rounded-lg">
                      {company.digitalTwinStrategy || manualStrategy}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Kanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No detailed strategy analysis available</p>
                    <p className="text-sm mt-2">Click "Generate AI Strategy" to create a comprehensive analysis</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="dell-opportunity" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Dell Opportunity Assessment</h3>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={() => generateOpportunityAssessmentMutation.mutate({
                      id: company.id,
                      companyName: company.name,
                      industry: company.industry
                    })}
                    disabled={generateOpportunityAssessmentMutation.isPending}
                  >
                    {generateOpportunityAssessmentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Generate AI Assessment
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Opportunity Score */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    Opportunity Score
                  </h4>
                  <div className="text-center py-6">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {(company.opportunityScore / 10).toFixed(1)}/10
                    </div>
                    <div className="flex justify-center space-x-1 mb-4">
                      {opportunityDots}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {company.opportunityScore >= 80 && "🔥 High Priority"}
                      {company.opportunityScore >= 60 && company.opportunityScore < 80 && "⚡ Medium Priority"}
                      {company.opportunityScore < 60 && "📋 Low Priority"}
                    </div>
                  </div>
                </Card>

                {/* Deal Potential */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Deal Potential
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Estimated Deal Value</div>
                      <div className="text-2xl font-bold text-green-600">
                        {company.estimatedDealValue || "TBD"}
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Company Size</div>
                      <div className="text-lg font-semibold">
                        {company.employees ? `${company.employees.toLocaleString()} employees` : 'Size not specified'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {company.revenue || 'Revenue not specified'}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pain Points */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    Pain Points
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">Digital Twin Gap</div>
                      <div className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {company.digitalTwinMaturity}% maturity - room for improvement
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">Industry Challenges</div>
                      <div className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {company.industry} sector needs
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Dell Solutions */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    Dell Solutions
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Infrastructure</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">PowerEdge servers & storage</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Edge Computing</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">Real-time processing solutions</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Professional Services</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">Implementation & consulting</div>
                    </div>
                  </div>
                </Card>

                {/* Next Steps */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    Next Steps
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">1. Discovery Call</div>
                      <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">Assess current state</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">2. ROI Analysis</div>
                      <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">Quantify the opportunity</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">3. Proposal</div>
                      <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">Tailored solution design</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Assessment */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Detailed Assessment Notes</h4>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingOpportunity(!isEditingOpportunity)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingOpportunity ? 'Cancel Edit' : 'Edit Notes'}
                  </Button>
                </div>

                {isEditingOpportunity ? (
                  <div className="space-y-4">
                    <Textarea
                      value={manualOpportunity}
                      onChange={(e) => setManualOpportunity(e.target.value)}
                      placeholder="Enter detailed Dell opportunity assessment and strategy notes..."
                      className="min-h-[300px] resize-none text-base leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={saveOpportunity}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Assessment
                      </Button>
                    </div>
                  </div>
                ) : (company.dellOpportunity || manualOpportunity) ? (
                  <div className="prose prose-base max-w-none">
                    <div className="text-base whitespace-pre-wrap leading-relaxed p-4 bg-secondary/20 rounded-lg">
                      {company.dellOpportunity || manualOpportunity}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No detailed assessment available</p>
                    <p className="text-sm mt-2">Click "Generate AI Assessment" for comprehensive Dell opportunity analysis</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="competitive" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Competitive Analysis</h3>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={() => generateCompetitiveAnalysisMutation.mutate({
                      id: company.id,
                      companyName: company.name,
                      industry: company.industry
                    })}
                    disabled={generateCompetitiveAnalysisMutation.isPending}
                  >
                    {generateCompetitiveAnalysisMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Generate AI Analysis
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Position */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                    Market Position
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Industry</div>
                      <div className="text-lg font-semibold">{company.industry}</div>
                      <div className="text-sm text-muted-foreground mt-1">Market sector focus</div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Company Scale</div>
                      <div className="text-lg font-semibold">
                        {company.employees ? `${company.employees.toLocaleString()} employees` : 'Enterprise'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {company.revenue || 'Revenue scale not specified'}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Digital Readiness */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full mr-3"></div>
                    Digital Readiness
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">Current Maturity</div>
                        <div className="text-lg font-bold">{company.digitalTwinMaturity}%</div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getMaturityColor(company.digitalTwinMaturity)}`}
                          style={{ width: `${company.digitalTwinMaturity}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Implementation Status</div>
                      <Badge className={statusColors[company.digitalTwinStatus as keyof typeof statusColors]}>
                        {statusLabels[company.digitalTwinStatus as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Competitors */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    Key Competitors
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">AWS IoT TwinMaker</div>
                      <div className="text-sm text-red-600 dark:text-red-300 mt-1">Cloud-native platform</div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">Microsoft Azure Digital Twins</div>
                      <div className="text-sm text-red-600 dark:text-red-300 mt-1">Enterprise integration</div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">Siemens MindSphere</div>
                      <div className="text-sm text-red-600 dark:text-red-300 mt-1">Industrial IoT focus</div>
                    </div>
                  </div>
                </Card>

                {/* Dell Advantages */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Dell Advantages
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">Edge-to-Cloud</div>
                      <div className="text-sm text-green-600 dark:text-green-300 mt-1">Integrated infrastructure</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">Partner Ecosystem</div>
                      <div className="text-sm text-green-600 dark:text-green-300 mt-1">Vendor relationships</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">Professional Services</div>
                      <div className="text-sm text-green-600 dark:text-green-300 mt-1">Implementation support</div>
                    </div>
                  </div>
                </Card>

                {/* Threats & Risks */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    Threats & Risks
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Cloud-First Preference</div>
                      <div className="text-sm text-orange-600 dark:text-orange-300 mt-1">Customer bias toward cloud</div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Existing Relationships</div>
                      <div className="text-sm text-orange-600 dark:text-orange-300 mt-1">Incumbent vendor lock-in</div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Budget Constraints</div>
                      <div className="text-sm text-orange-600 dark:text-orange-300 mt-1">Economic pressures</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Competitive Strategy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    Differentiation Strategy
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Hybrid Architecture</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">Edge + cloud flexibility</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Industry Expertise</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">{company.industry} specialization</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">TCO Advantage</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">Cost-effective scaling</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    Win Strategy
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">1. Pilot Program</div>
                      <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">Low-risk proof of concept</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">2. ROI Demonstration</div>
                      <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">Quantified business value</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">3. Partnership Approach</div>
                      <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">Long-term relationship focus</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Detailed Competitive Analysis</h4>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingCompetitive(!isEditingCompetitive)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingCompetitive ? 'Cancel Edit' : 'Edit Analysis'}
                  </Button>
                </div>

                {isEditingCompetitive ? (
                  <div className="space-y-4">
                    <Textarea
                      value={manualCompetitive}
                      onChange={(e) => setManualCompetitive(e.target.value)}
                      placeholder="Enter detailed competitive analysis, market positioning, and strategic insights..."
                      className="min-h-[300px] resize-none text-base leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={saveCompetitive}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Analysis
                      </Button>
                    </div>
                  </div>
                ) : (company.competitiveAnalysis || manualCompetitive) ? (
                  <div className="prose prose-base max-w-none">
                    <div className="text-base whitespace-pre-wrap leading-relaxed p-4 bg-secondary/20 rounded-lg">
                      {company.competitiveAnalysis || manualCompetitive}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No detailed competitive analysis available</p>
                    <p className="text-sm mt-2">Click "Generate AI Analysis" for comprehensive competitive intelligence</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}