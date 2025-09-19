import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Company } from "@shared/schema";
import { X, Loader2, Brain, Target, Kanban, Edit3, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function CompanyModal({ company, isOpen, onClose }: CompanyModalProps) {
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
      // Invalidate all company-related queries to refresh data everywhere
      utils.companies.invalidate();

      toast({
        title: "Research Updated",
        description: "Manual research has been saved successfully.",
      });

      console.log('Update successful:', updatedCompany); // Debug log
    },
    onError: (error) => {
      console.error('Update failed:', error); // Debug log
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
    console.log('Saving strategy:', manualStrategy); // Debug log
    updateCompanyMutation.mutate({
      id: company.id,
      data: { digitalTwinStrategy: manualStrategy }
    });
    setIsEditingStrategy(false);
  };

  const saveOpportunity = () => {
    if (!company) return;
    console.log('Saving opportunity:', manualOpportunity); // Debug log
    updateCompanyMutation.mutate({
      id: company.id,
      data: { dellOpportunity: manualOpportunity }
    });
    setIsEditingOpportunity(false);
  };

  const saveCompetitive = () => {
    if (!company) return;
    console.log('Saving competitive:', manualCompetitive); // Debug log
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

  if (!company) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" data-testid="company-modal">
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">
                {getCompanyInitials(company.name)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-card-foreground" data-testid="modal-company-name">
                {company.name}
              </h2>
              <p className="text-muted-foreground">
                {company.industry} • {company.country}
                {company.employees && ` • ${company.employees.toLocaleString()} employees`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
            <X className="w-6 h-6" />
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Status and Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Digital Twin Status</span>
                  <Badge className={statusColors[company.digitalTwinStatus as keyof typeof statusColors]}>
                    {statusLabels[company.digitalTwinStatus as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getMaturityColor(company.digitalTwinMaturity)}`}
                      style={{ width: `${company.digitalTwinMaturity}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{company.digitalTwinMaturity}%</span>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/50">
                <div className="text-sm font-medium text-muted-foreground mb-2">Opportunity Score</div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {opportunityDots}
                  </div>
                  <span className="text-lg font-bold">{(company.opportunityScore / 10).toFixed(1)}</span>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/50">
                <div className="text-sm font-medium text-muted-foreground mb-2">Estimated Deal Value</div>
                <div className="text-2xl font-bold text-card-foreground">
                  {company.estimatedDealValue || "TBD"}
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="strategy" data-testid="tab-strategy">Digital Twin Kanban</TabsTrigger>
                <TabsTrigger value="dell-opportunity" data-testid="tab-dell-opportunity">Dell Opportunity</TabsTrigger>
                <TabsTrigger value="competitive" data-testid="tab-competitive">Competitive Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                    <div className="space-y-3">
                      {company.revenue && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-medium">{company.revenue}</span>
                        </div>
                      )}
                      {company.employees && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employees</span>
                          <span className="font-medium">{company.employees.toLocaleString()}</span>
                        </div>
                      )}
                      {company.headquarters && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Headquarters</span>
                          <span className="font-medium">{company.headquarters}</span>
                        </div>
                      )}
                      {company.ceo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CEO</span>
                          <span className="font-medium">{company.ceo}</span>
                        </div>
                      )}
                      {company.founded && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founded</span>
                          <span className="font-medium">{company.founded}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Business Areas</h3>
                    <div className="space-y-2">
                      {company.businessAreas?.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{area}</span>
                        </div>
                      )) || <p className="text-muted-foreground text-sm">No business areas specified</p>}
                    </div>
                  </div>
                </div>

                {company.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notes</h3>
                    <Card className="p-4 bg-secondary/30">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{company.notes}</p>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="strategy" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Digital Twin Kanban Analysis</h3>
                  <div className="flex gap-2">
                    {!isEditingStrategy ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingStrategy(true)}
                          data-testid="button-edit-strategy"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Manually
                        </Button>
                        <Button
                          onClick={() => generateDigitalTwinStrategyMutation.mutate({
                            id: company.id,
                            companyName: company.name,
                            industry: company.industry
                          })}
                          disabled={generateDigitalTwinStrategyMutation.isPending}
                          data-testid="button-generate-strategy"
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
                          onClick={() => {
                            setIsEditingStrategy(false);
                            setManualStrategy(company.digitalTwinStrategy || "");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
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
                  <Card className="p-6">
                    <Textarea
                      value={manualStrategy}
                      onChange={(e) => setManualStrategy(e.target.value)}
                      placeholder="Enter your digital twin strategy analysis..."
                      className="min-h-[300px] resize-none"
                      data-testid="textarea-strategy"
                    />
                  </Card>
                ) : (company.digitalTwinStrategy || manualStrategy) ? (
                  <Card className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm whitespace-pre-wrap">{company.digitalTwinStrategy || manualStrategy}</div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <p className="text-muted-foreground">No digital twin strategy analysis available. Click &quot;Generate AI Analysis&quot; to create one or &quot;Edit Manually&quot; to add your own.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="dell-opportunity" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Dell Opportunity Assessment</h3>
                  <div className="flex gap-2">
                    {!isEditingOpportunity ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingOpportunity(true)}
                          data-testid="button-edit-opportunity"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Manually
                        </Button>
                        <Button
                          onClick={() => generateOpportunityAssessmentMutation.mutate({
                            id: company.id,
                            companyName: company.name,
                            industry: company.industry
                          })}
                          disabled={generateOpportunityAssessmentMutation.isPending}
                          data-testid="button-generate-opportunity"
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
                          onClick={() => {
                            setIsEditingOpportunity(false);
                            setManualOpportunity(company.dellOpportunity || "");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
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
                  <Card className="p-6">
                    <Textarea
                      value={manualOpportunity}
                      onChange={(e) => setManualOpportunity(e.target.value)}
                      placeholder="Enter your Dell opportunity assessment..."
                      className="min-h-[300px] resize-none"
                      data-testid="textarea-opportunity"
                    />
                  </Card>
                ) : (company.dellOpportunity || manualOpportunity) ? (
                  <Card className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm whitespace-pre-wrap">{company.dellOpportunity || manualOpportunity}</div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <p className="text-muted-foreground">No Dell opportunity assessment available. Click &quot;Generate AI Assessment&quot; to create one or &quot;Edit Manually&quot; to add your own.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="competitive" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Competitive Analysis</h3>
                  <div className="flex gap-2">
                    {!isEditingCompetitive ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingCompetitive(true)}
                          data-testid="button-edit-competitive"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Manually
                        </Button>
                        <Button
                          onClick={() => generateCompetitiveAnalysisMutation.mutate({
                            id: company.id,
                            companyName: company.name,
                            industry: company.industry
                          })}
                          disabled={generateCompetitiveAnalysisMutation.isPending}
                          data-testid="button-generate-competitive"
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
                          onClick={() => {
                            setIsEditingCompetitive(false);
                            setManualCompetitive(company.competitiveAnalysis || "");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
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
                  <Card className="p-6">
                    <Textarea
                      value={manualCompetitive}
                      onChange={(e) => setManualCompetitive(e.target.value)}
                      placeholder="Enter your competitive analysis..."
                      className="min-h-[300px] resize-none"
                      data-testid="textarea-competitive"
                    />
                  </Card>
                ) : (company.competitiveAnalysis || manualCompetitive) ? (
                  <Card className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm whitespace-pre-wrap">{company.competitiveAnalysis || manualCompetitive}</div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <p className="text-muted-foreground">No competitive analysis available. Click &quot;Generate AI Analysis&quot; to create one or &quot;Edit Manually&quot; to add your own.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
