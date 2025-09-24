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

            <TabsContent value="strategy" className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Digital Twin Kanban Analysis</h3>
                <div className="flex gap-3">
                  {!isEditingStrategy ? (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsEditingStrategy(true)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Manually
                      </Button>
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
                        Generate AI Analysis
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsEditingStrategy(false);
                          setManualStrategy(company.digitalTwinStrategy || "");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="lg"
                        onClick={saveStrategy}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditingStrategy ? (
                <Card className="p-8">
                  <Textarea
                    value={manualStrategy}
                    onChange={(e) => setManualStrategy(e.target.value)}
                    placeholder="Enter your digital twin strategy analysis..."
                    className="min-h-[400px] resize-none text-base leading-relaxed"
                  />
                </Card>
              ) : (company.digitalTwinStrategy || manualStrategy) ? (
                <Card className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <div className="text-base whitespace-pre-wrap leading-relaxed">{company.digitalTwinStrategy || manualStrategy}</div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8">
                  <p className="text-muted-foreground text-lg text-center py-12">No digital twin strategy analysis available. Click "Generate AI Analysis" to create one or "Edit Manually" to add your own.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="dell-opportunity" className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Dell Opportunity Assessment</h3>
                <div className="flex gap-3">
                  {!isEditingOpportunity ? (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsEditingOpportunity(true)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Manually
                      </Button>
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
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsEditingOpportunity(false);
                          setManualOpportunity(company.dellOpportunity || "");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="lg"
                        onClick={saveOpportunity}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditingOpportunity ? (
                <Card className="p-8">
                  <Textarea
                    value={manualOpportunity}
                    onChange={(e) => setManualOpportunity(e.target.value)}
                    placeholder="Enter your Dell opportunity assessment..."
                    className="min-h-[400px] resize-none text-base leading-relaxed"
                  />
                </Card>
              ) : (company.dellOpportunity || manualOpportunity) ? (
                <Card className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <div className="text-base whitespace-pre-wrap leading-relaxed">{company.dellOpportunity || manualOpportunity}</div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8">
                  <p className="text-muted-foreground text-lg text-center py-12">No Dell opportunity assessment available. Click "Generate AI Assessment" to create one or "Edit Manually" to add your own.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="competitive" className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Competitive Analysis</h3>
                <div className="flex gap-3">
                  {!isEditingCompetitive ? (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsEditingCompetitive(true)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Manually
                      </Button>
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
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsEditingCompetitive(false);
                          setManualCompetitive(company.competitiveAnalysis || "");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="lg"
                        onClick={saveCompetitive}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditingCompetitive ? (
                <Card className="p-8">
                  <Textarea
                    value={manualCompetitive}
                    onChange={(e) => setManualCompetitive(e.target.value)}
                    placeholder="Enter your competitive analysis..."
                    className="min-h-[400px] resize-none text-base leading-relaxed"
                  />
                </Card>
              ) : (company.competitiveAnalysis || manualCompetitive) ? (
                <Card className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <div className="text-base whitespace-pre-wrap leading-relaxed">{company.competitiveAnalysis || manualCompetitive}</div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8">
                  <p className="text-muted-foreground text-lg text-center py-12">No competitive analysis available. Click "Generate AI Analysis" to create one or "Edit Manually" to add your own.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}