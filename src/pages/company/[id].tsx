import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Company } from "@shared/schema";
import {
  ArrowLeft,
  Loader2,
  Edit3,
  Save,
  Plus,
  X,
  BarChart3,
  Users,
  FileText,
  GitCompare,
  Kanban,
  Target,
  Globe,
  Link,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { ScoringDashboard } from "@/components/scoring/ScoringDashboard";
import { ComparisonView } from "@/components/scoring/ComparisonView";
import { ISVPartnersTab } from "@/components/isv/ISVPartnersTab";
import {
  getScoreColor,
  getScoreLabel,
  formatScore,
  getScoreEmoji,
} from "@/lib/scoring";

const statusColors = {
  not_started: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  researching:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  implementing:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
};

const statusLabels = {
  not_started: "Not Started",
  researching: "Researching",
  implementing: "Implementing",
  completed: "Completed",
};

function getCompanyInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function getMaturityColor(maturity: number) {
  if (maturity < 30) return "bg-red-500";
  if (maturity < 60) return "bg-yellow-500";
  if (maturity < 90) return "bg-green-500";
  return "bg-blue-500";
}

function renderMarkdownText(text: string) {
  if (!text) return null;

  // Split text into lines for processing
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];

  lines.forEach((line, index) => {
    if (line.trim() === "") {
      elements.push(<br key={`br-${index}`} />);
      return;
    }

    // Handle bullet points
    if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
      const content = line.replace(/^[\s]*[•-]\s*/, "");
      const processedContent = processBoldText(content);
      elements.push(
        <div key={index} className="flex items-start space-x-2 my-2">
          <span className="text-primary mt-1">•</span>
          <span className="flex-1">{processedContent}</span>
        </div>
      );
      return;
    }

    // Handle regular lines
    const processedContent = processBoldText(line);
    elements.push(
      <div key={index} className="my-2">
        {processedContent}
      </div>
    );
  });

  return <div>{elements}</div>;
}

function processBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

export default function CompanyDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState("scoring");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Manual editing states
  const [isEditingStrategy, setIsEditingStrategy] = useState(false);
  const [isEditingOpportunity, setIsEditingOpportunity] = useState(false);
  const [isEditingCompetitive, setIsEditingCompetitive] = useState(false);
  const [isEditingPersonnel, setIsEditingPersonnel] = useState(false);

  // Component editing states
  const [isEditingCompanyData, setIsEditingCompanyData] = useState(false);
  const [isEditingBusinessAreas, setIsEditingBusinessAreas] = useState(false);
  const [isEditingDealValue, setIsEditingDealValue] = useState(false);
  const [isEditingMaturity, setIsEditingMaturity] = useState(false);
  const [isEditingKeyInitiatives, setIsEditingKeyInitiatives] = useState(false);
  const [isEditingRecommendations, setIsEditingRecommendations] =
    useState(false);

  // Dell Opportunity editing states
  const [isEditingPainPoints, setIsEditingPainPoints] = useState(false);
  const [isEditingDellSolutions, setIsEditingDellSolutions] = useState(false);
  const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);

  // Competitive Analysis editing states
  const [isEditingCompetitors, setIsEditingCompetitors] = useState(false);
  const [isEditingDellAdvantages, setIsEditingDellAdvantages] = useState(false);
  const [isEditingThreats, setIsEditingThreats] = useState(false);
  const [isEditingDifferentiation, setIsEditingDifferentiation] =
    useState(false);
  const [isEditingWinStrategy, setIsEditingWinStrategy] = useState(false);

  // Manual content states
  const [manualStrategy, setManualStrategy] = useState("");
  const [manualOpportunity, setManualOpportunity] = useState("");
  const [manualCompetitive, setManualCompetitive] = useState("");
  type Personnel = {
    name: string;
    title: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
  const [editablePersonnel, setEditablePersonnel] = useState<Personnel[]>([]);

  // Editable component states
  const [editableCompanyData, setEditableCompanyData] = useState({
    revenue: "",
    employees: 0,
    headquarters: "",
    ceo: "",
    founded: 0,
    website: "",
    estimatedDealValue: "",
  });
  const [editableBusinessAreas, setEditableBusinessAreas] = useState<string[]>(
    []
  );
  const [editableMaturity, setEditableMaturity] = useState(0);
  const [editableStatus, setEditableStatus] = useState("");
  const [editableKeyInitiatives, setEditableKeyInitiatives] = useState<
    string[]
  >([]);
  const [editableRecommendations, setEditableRecommendations] = useState([
    { title: "Industry Focus", description: "Technology-specific solutions" },
    { title: "Scale Factor", description: "10,000 employee implementation" },
  ]);

  // Dell Opportunity editable states
  const [editablePainPoints, setEditablePainPoints] = useState([
    {
      title: "Digital Twin Gap",
      description: "0% maturity - room for improvement",
    },
    { title: "Industry Challenges", description: "Technology sector needs" },
  ]);
  const [editableDellSolutions, setEditableDellSolutions] = useState([
    { title: "Infrastructure", description: "PowerEdge servers & storage" },
    { title: "Edge Computing", description: "Real-time processing solutions" },
    {
      title: "Professional Services",
      description: "Implementation & consulting",
    },
  ]);
  const [editableNextSteps, setEditableNextSteps] = useState([
    { title: "1. Discovery Call", description: "Assess current state" },
    { title: "2. ROI Analysis", description: "Quantify the opportunity" },
    { title: "3. Proposal", description: "Tailored solution design" },
  ]);

  // Competitive Analysis editable states
  const [editableCompetitors, setEditableCompetitors] = useState([
    { title: "AWS IoT TwinMaker", description: "Cloud-native platform" },
    {
      title: "Microsoft Azure Digital Twins",
      description: "Enterprise integration",
    },
    { title: "Siemens MindSphere", description: "Industrial IoT focus" },
  ]);
  const [editableDellAdvantages, setEditableDellAdvantages] = useState([
    { title: "Edge-to-Cloud", description: "Integrated infrastructure" },
    { title: "Partner Ecosystem", description: "Vendor relationships" },
    { title: "Professional Services", description: "Implementation support" },
  ]);
  const [editableThreats, setEditableThreats] = useState([
    {
      title: "Cloud-First Preference",
      description: "Customer bias toward cloud",
    },
    {
      title: "Existing Relationships",
      description: "Incumbent vendor lock-in",
    },
    { title: "Budget Constraints", description: "Economic pressures" },
  ]);
  const [editableDifferentiation, setEditableDifferentiation] = useState([
    { title: "Hybrid Architecture", description: "Edge + cloud flexibility" },
    { title: "Industry Expertise", description: "Technology specialization" },
    { title: "TCO Advantage", description: "Cost-effective scaling" },
  ]);
  const [editableWinStrategy, setEditableWinStrategy] = useState([
    { title: "1. Pilot Program", description: "Low-risk proof of concept" },
    { title: "2. ROI Demonstration", description: "Quantified business value" },
    {
      title: "3. Partnership Approach",
      description: "Long-term relationship focus",
    },
  ]);

  // Fetch company data
  const {
    data: company,
    isLoading,
    error,
    refetch,
  } = trpc.companies.getById.useQuery({ id: id as string }, { enabled: !!id });

  // Fetch all companies for comparison
  const { data: allCompanies = [] } = trpc.companies.getAll.useQuery();

  // Initialize manual content when company changes
  useEffect(() => {
    if (company) {
      setManualStrategy(company.digitalTwinStrategy || "");
      setManualOpportunity(company.dellOpportunity || "");
      setManualCompetitive(company.competitiveAnalysis || "");

      // Initialize editable component states
      setEditableCompanyData({
        revenue: company.revenue || "",
        employees: company.employees || 0,
        headquarters: company.headquarters || "",
        ceo: company.ceo || "",
        founded: company.founded || 0,
        website: company.website || "",
        estimatedDealValue: company.estimatedDealValue || "",
      });
      setEditableBusinessAreas(company.businessAreas || []);
      setEditableMaturity(company.digitalTwinMaturity || 0);
      const validStatuses = [
        "not_started",
        "researching",
        "implementing",
        "completed",
      ];
      const statusValue =
        company.digitalTwinStatus &&
        validStatuses.includes(company.digitalTwinStatus)
          ? company.digitalTwinStatus
          : "not_started";
      setEditableStatus(statusValue);
      setEditableKeyInitiatives(company.businessAreas || []);

      // Try to parse recommendations from notes field, fallback to defaults
      let recommendations = [
        {
          title: "Industry Focus",
          description: `${company.industry}-specific solutions`,
        },
        {
          title: "Scale Factor",
          description: `${
            company.employees
              ? company.employees.toLocaleString() + " employee"
              : "Enterprise"
          } implementation`,
        },
      ];

      if (company.notes) {
        try {
          const parsed = JSON.parse(company.notes);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed[0].title &&
            parsed[0].description
          ) {
            recommendations = parsed;
          }
        } catch (e) {
          // Keep default recommendations if parsing fails
        }
      }

      setEditableRecommendations(recommendations);

      // Initialize structured components data from database or defaults
      const painPointsData = Array.isArray(company.painPoints)
        ? (company.painPoints as Array<{ title: string; description: string }>)
        : [
            {
              title: "Digital Twin Gap",
              description: "0% maturity - room for improvement",
            },
            {
              title: "Industry Challenges",
              description: "Technology sector needs",
            },
          ];
      setEditablePainPoints(painPointsData);
      const dellSolutionsData = Array.isArray(company.dellSolutions)
        ? (company.dellSolutions as Array<{
            title: string;
            description: string;
          }>)
        : [
            {
              title: "Infrastructure",
              description: "PowerEdge servers & storage",
            },
            {
              title: "Edge Computing",
              description: "Real-time processing solutions",
            },
            {
              title: "Professional Services",
              description: "Implementation & consulting",
            },
          ];
      setEditableDellSolutions(dellSolutionsData);
      const nextStepsData = Array.isArray(company.nextSteps)
        ? (company.nextSteps as Array<{ title: string; description: string }>)
        : [
            { title: "1. Discovery Call", description: "Assess current state" },
            {
              title: "2. ROI Analysis",
              description: "Quantify the opportunity",
            },
            { title: "3. Proposal", description: "Tailored solution design" },
          ];
      setEditableNextSteps(nextStepsData);
      const competitorsData = Array.isArray(company.competitors)
        ? (company.competitors as Array<{ title: string; description: string }>)
        : [
            {
              title: "AWS IoT TwinMaker",
              description: "Cloud-native platform",
            },
            {
              title: "Microsoft Azure Digital Twins",
              description: "Enterprise integration",
            },
            {
              title: "Siemens MindSphere",
              description: "Industrial IoT focus",
            },
          ];
      setEditableCompetitors(competitorsData);
      const dellAdvantagesData = Array.isArray(company.dellAdvantages)
        ? (company.dellAdvantages as Array<{
            title: string;
            description: string;
          }>)
        : [
            {
              title: "Edge-to-Cloud",
              description: "Integrated infrastructure",
            },
            {
              title: "Partner Ecosystem",
              description: "Proven collaborations",
            },
            {
              title: "Professional Services",
              description: "Implementation support",
            },
          ];
      setEditableDellAdvantages(dellAdvantagesData);
      const threatsData = Array.isArray(company.threats)
        ? (company.threats as Array<{ title: string; description: string }>)
        : [
            {
              title: "Cloud-First Preference",
              description: "Customer bias toward cloud",
            },
            {
              title: "Existing Relationships",
              description: "Incumbent partnerships",
            },
            { title: "Budget Constraints", description: "Economic downturn" },
          ];
      setEditableThreats(threatsData);
      const differentiationData = Array.isArray(company.differentiation)
        ? (company.differentiation as Array<{
            title: string;
            description: string;
          }>)
        : [
            {
              title: "Hybrid Architecture",
              description: "Edge + cloud flexibility",
            },
            {
              title: "Industry Expertise",
              description: "Technology specialization",
            },
            { title: "TCO Advantage", description: "Cost-effective scaling" },
          ];
      setEditableDifferentiation(differentiationData);
      const winStrategyData = Array.isArray(company.winStrategy)
        ? (company.winStrategy as Array<{ title: string; description: string }>)
        : [
            {
              title: "1. Pilot Program",
              description: "Low-risk proof of concept",
            },
            {
              title: "2. ROI Demonstration",
              description: "Quantified business value",
            },
            {
              title: "3. Partnership Approach",
              description: "Long-term relationship focus",
            },
          ];
      setEditableWinStrategy(winStrategyData);
      setEditablePersonnel((company as any).personnel || []);
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
      data: { digitalTwinStrategy: manualStrategy },
    });
    setIsEditingStrategy(false);
  };

  const saveOpportunity = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { dellOpportunity: manualOpportunity },
    });
    setIsEditingOpportunity(false);
  };

  const saveCompetitive = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { competitiveAnalysis: manualCompetitive },
    });
    setIsEditingCompetitive(false);
  };

  // Save functions for editable components
  const saveCompanyData = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        revenue: editableCompanyData.revenue,
        employees: editableCompanyData.employees,
        headquarters: editableCompanyData.headquarters,
        ceo: editableCompanyData.ceo,
        founded: editableCompanyData.founded,
        website: editableCompanyData.website,
        estimatedDealValue: editableCompanyData.estimatedDealValue,
      },
    });
    setIsEditingCompanyData(false);
  };

  const saveBusinessAreas = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { businessAreas: editableBusinessAreas },
    });
    setIsEditingBusinessAreas(false);
  };

  const saveMaturityAndStatus = () => {
    if (!company) return;

    // Ensure we have valid values
    const maturity = Number(editableMaturity) || 0;
    const status = String(editableStatus).toLowerCase();

    // Validate status value
    const validStatuses = [
      "not_started",
      "researching",
      "implementing",
      "completed",
    ] as const;
    const finalStatus: (typeof validStatuses)[number] = validStatuses.includes(
      status as any
    )
      ? (status as any)
      : "not_started";

    console.log("Saving maturity and status:", {
      digitalTwinMaturity: maturity,
      digitalTwinStatus: finalStatus,
      originalStatus: editableStatus,
    });

    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        digitalTwinMaturity: maturity,
        digitalTwinStatus: finalStatus,
      },
    });
    setIsEditingMaturity(false);
  };

  const saveKeyInitiatives = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { businessAreas: editableKeyInitiatives },
    });
    setIsEditingKeyInitiatives(false);
  };

  const saveRecommendations = () => {
    if (!company) return;
    // Save recommendations as JSON in the notes field
    updateCompanyMutation.mutate({
      id: company.id,
      data: { notes: JSON.stringify(editableRecommendations) },
    });
    setIsEditingRecommendations(false);
  };

  const addBusinessArea = () => {
    setEditableBusinessAreas([...editableBusinessAreas, ""]);
  };

  const addKeyInitiative = () => {
    setEditableKeyInitiatives([...editableKeyInitiatives, ""]);
  };

  const removeKeyInitiative = (index: number) => {
    setEditableKeyInitiatives(
      editableKeyInitiatives.filter((_, i) => i !== index)
    );
  };

  const updateKeyInitiative = (index: number, value: string) => {
    const updated = [...editableKeyInitiatives];
    updated[index] = value;
    setEditableKeyInitiatives(updated);
  };

  // Save functions for structured components
  const savePainPoints = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        painPoints: editablePainPoints,
      },
    });
    setIsEditingPainPoints(false);
  };

  const saveDellSolutions = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        dellSolutions: editableDellSolutions,
      },
    });
    setIsEditingDellSolutions(false);
  };

  const saveNextSteps = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        nextSteps: editableNextSteps,
      },
    });
    setIsEditingNextSteps(false);
  };

  const saveCompetitors = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        competitors: editableCompetitors,
      },
    });
    setIsEditingCompetitors(false);
  };

  const saveDellAdvantages = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        dellAdvantages: editableDellAdvantages,
      },
    });
    setIsEditingDellAdvantages(false);
  };

  const saveThreats = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        threats: editableThreats,
      },
    });
    setIsEditingThreats(false);
  };

  const saveDifferentiation = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        differentiation: editableDifferentiation,
      },
    });
    setIsEditingDifferentiation(false);
  };

  const saveWinStrategy = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: {
        winStrategy: editableWinStrategy,
      },
    });
    setIsEditingWinStrategy(false);
  };

  const removeBusinessArea = (index: number) => {
    setEditableBusinessAreas(
      editableBusinessAreas.filter((_, i) => i !== index)
    );
  };

  const updateBusinessArea = (index: number, value: string) => {
    const updated = [...editableBusinessAreas];
    updated[index] = value;
    setEditableBusinessAreas(updated);
  };

  // Helper functions for editable list sections
  const createListHelpers = (list: any[], setList: any) => ({
    add: () => setList([...list, { title: "", description: "" }]),
    remove: (index: number) => setList(list.filter((_, i) => i !== index)),
    updateTitle: (index: number, title: string) => {
      const updated = [...list];
      updated[index] = { ...updated[index], title };
      setList(updated);
    },
    updateDescription: (index: number, description: string) => {
      const updated = [...list];
      updated[index] = { ...updated[index], description };
      setList(updated);
    },
  });

  const painPointHelpers = createListHelpers(
    editablePainPoints,
    setEditablePainPoints
  );
  const dellSolutionHelpers = createListHelpers(
    editableDellSolutions,
    setEditableDellSolutions
  );
  const nextStepHelpers = createListHelpers(
    editableNextSteps,
    setEditableNextSteps
  );
  const competitorHelpers = createListHelpers(
    editableCompetitors,
    setEditableCompetitors
  );
  const dellAdvantageHelpers = createListHelpers(
    editableDellAdvantages,
    setEditableDellAdvantages
  );
  const threatHelpers = createListHelpers(editableThreats, setEditableThreats);
  const differentiationHelpers = createListHelpers(
    editableDifferentiation,
    setEditableDifferentiation
  );
  const winStrategyHelpers = createListHelpers(
    editableWinStrategy,
    setEditableWinStrategy
  );
  const recommendationHelpers = createListHelpers(
    editableRecommendations,
    setEditableRecommendations
  );

  // AI generation mutations
  const generateCompetitiveAnalysisMutation =
    trpc.companies.generateCompetitiveAnalysis.useMutation({
      onSuccess: () => {
        utils.companies.invalidate();
        toast({
          title: "Analysis Generated",
          description:
            "AI competitive analysis has been generated successfully.",
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

  const generateOpportunityAssessmentMutation =
    trpc.companies.generateOpportunityAssessment.useMutation({
      onSuccess: () => {
        utils.companies.invalidate();
        toast({
          title: "Assessment Generated",
          description:
            "AI opportunity assessment has been generated successfully.",
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

  const generateDigitalTwinStrategyMutation =
    trpc.companies.generateDigitalTwinStrategy.useMutation({
      onSuccess: () => {
        utils.companies.invalidate();
        toast({
          title: "Strategy Generated",
          description:
            "AI digital twin strategy has been generated successfully.",
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

  const addPersonnel = () => {
    setEditablePersonnel([
      ...editablePersonnel,
      { name: "", title: "", email: "", phone: "", notes: "" },
    ]);
  };

  const removePersonnel = (index: number) => {
    setEditablePersonnel(editablePersonnel.filter((_, i) => i !== index));
  };

  const updatePersonnelField = (
    index: number,
    key: keyof Personnel,
    value: string
  ) => {
    const updated = [...editablePersonnel];
    updated[index] = { ...updated[index], [key]: value } as Personnel;
    setEditablePersonnel(updated);
  };

  const savePersonnel = () => {
    if (!company) return;
    updateCompanyMutation.mutate({
      id: company.id,
      data: { personnel: editablePersonnel as any },
    });
    setIsEditingPersonnel(false);
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
            <p className="text-muted-foreground text-lg mb-4">
              Company not found or an error occurred.
            </p>
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
        description={`${company.industry} • ${company.country}${
          company.employees
            ? ` • ${company.employees.toLocaleString()} employees`
            : ""
        }`}
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
                {company.employees &&
                  ` • ${company.employees.toLocaleString()} employees`}
              </p>
            </div>
          </div>

          {/* Status and Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Digital Twin Status
                </span>
                <Badge
                  className={
                    statusColors[
                      company.digitalTwinStatus as keyof typeof statusColors
                    ]
                  }
                >
                  {
                    statusLabels[
                      company.digitalTwinStatus as keyof typeof statusLabels
                    ]
                  }
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-muted rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${getMaturityColor(
                      company.digitalTwinMaturity
                    )}`}
                    style={{ width: `${company.digitalTwinMaturity}%` }}
                  />
                </div>
                <span className="text-lg font-bold">
                  {company.digitalTwinMaturity}%
                </span>
              </div>
            </Card>

            <Card className="p-6 bg-secondary/50">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                Opportunity Score
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">{opportunityDots}</div>
                <span className="text-2xl font-bold">
                  {(company.opportunityScore / 10).toFixed(1)}
                </span>
              </div>
            </Card>

            <Card className="p-6 bg-secondary/50">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                Estimated Deal Value
              </div>
              <div className="text-3xl font-bold text-card-foreground">
                {company.estimatedDealValue || "TBD"}
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 mb-8 h-14 p-0 bg-muted rounded-lg">
              <TabsTrigger
                value="scoring"
                className="text-sm py-4 px-3 data-[state=active]:bg-background rounded-md mx-1 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Scoring</span>
              </TabsTrigger>
              <TabsTrigger
                value="comparison"
                className="text-sm py-4 px-3 data-[state=active]:bg-background rounded-md mx-1 flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden md:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger
                value="evidence"
                className="text-sm py-4 px-3 data-[state=active]:bg-background rounded-md mx-1 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden md:inline">Evidence</span>
              </TabsTrigger>
              <TabsTrigger
                value="isv-partners"
                className="text-sm py-4 px-3 data-[state=active]:bg-background rounded-md mx-1 flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">ISV Partners</span>
              </TabsTrigger>
              <TabsTrigger
                value="personnel"
                className="text-sm py-4 px-3 data-[state=active]:bg-background rounded-md mx-1 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">People</span>
              </TabsTrigger>
            </TabsList>

            {/* Scoring Dashboard Tab */}
            <TabsContent value="scoring">
              <ScoringDashboard
                company={company as any}
                onUpdate={() => {
                  refetch();
                  utils.companies.invalidate();
                }}
              />
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison">
              <ComparisonView
                companies={allCompanies as any}
                initialCompanyId={company.id}
              />
            </TabsContent>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="space-y-6">
              {(() => {
                const companyScores = (company as any).scores;
                return (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Evidence & Justifications</h3>

                {/* Evidence for each score */}
                <div className="space-y-6">
                  {companyScores?.dataReliabilityEvidence && companyScores.dataReliabilityEvidence.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        Data Reliability
                        <Badge variant="secondary">
                          {formatScore(companyScores.dataReliability)} / 5
                        </Badge>
                      </h4>
                      <div className="space-y-2">
                        {companyScores.dataReliabilityEvidence.map((evidence: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-sm">{evidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {companyScores?.industryEvidence && companyScores.industryEvidence.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        Industry Fit
                        <Badge variant="secondary">
                          {formatScore(companyScores.industry)} / 5
                        </Badge>
                      </h4>
                      <div className="space-y-2">
                        {companyScores.industryEvidence.map((evidence: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-sm">{evidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {companyScores?.existingRelationsEvidence && companyScores.existingRelationsEvidence.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        Existing Relations
                        <Badge variant="secondary">
                          {formatScore(companyScores.existingRelations)} / 5
                        </Badge>
                      </h4>
                      <div className="space-y-2">
                        {companyScores.existingRelationsEvidence.map((evidence: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-sm">{evidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!companyScores ||
                    ((!companyScores.dataReliabilityEvidence || companyScores.dataReliabilityEvidence.length === 0) &&
                     (!companyScores.industryEvidence || companyScores.industryEvidence.length === 0) &&
                     (!companyScores.existingRelationsEvidence || companyScores.existingRelationsEvidence.length === 0))) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No evidence points added yet.</p>
                      <p className="text-sm mt-2">Go to the Scoring tab to add evidence for each criterion.</p>
                    </div>
                  )}
                </div>
              </Card>
                );
              })()}
            </TabsContent>

            {/* Keep old tabs hidden for now but available */}
            <TabsContent value="overview" className="space-y-8" style={{display: 'none'}}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">
                      Company Information
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditingCompanyData(!isEditingCompanyData)
                      }
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditingCompanyData ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  {isEditingCompanyData ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Revenue
                        </label>
                        <Input
                          value={editableCompanyData.revenue}
                          onChange={(e) =>
                            setEditableCompanyData({
                              ...editableCompanyData,
                              revenue: e.target.value,
                            })
                          }
                          placeholder="e.g., $500M, $2.1B"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Employees
                        </label>
                        <Input
                          type="number"
                          value={editableCompanyData.employees}
                          onChange={(e) =>
                            setEditableCompanyData({
                              ...editableCompanyData,
                              employees: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="10000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Headquarters
                        </label>
                        <Input
                          value={editableCompanyData.headquarters}
                          onChange={(e) =>
                            setEditableCompanyData({
                              ...editableCompanyData,
                              headquarters: e.target.value,
                            })
                          }
                          placeholder="City, Country"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          CEO
                        </label>
                        <Input
                          value={editableCompanyData.ceo}
                          onChange={(e) =>
                            setEditableCompanyData({
                              ...editableCompanyData,
                              ceo: e.target.value,
                            })
                          }
                          placeholder="CEO Name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Founded
                        </label>
                        <Input
                          type="number"
                          value={editableCompanyData.founded}
                          onChange={(e) =>
                            setEditableCompanyData({
                              ...editableCompanyData,
                              founded: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="1998"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Website
                        </label>
                        <Input
                          value={editableCompanyData.website}
                          onChange={(e) =>
                            setEditableCompanyData({
                              ...editableCompanyData,
                              website: e.target.value,
                            })
                          }
                          placeholder="company.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Estimated Deal Value
                        </label>
                        <Input
                          value={editableCompanyData.estimatedDealValue}
                          onChange={(e) =>
                            setEditableCompanyData({
                              ...editableCompanyData,
                              estimatedDealValue: e.target.value,
                            })
                          }
                          placeholder="$500K, $2M"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={saveCompanyData}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(company.revenue || editableCompanyData.revenue) && (
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-medium text-lg">
                            {company.revenue || editableCompanyData.revenue}
                          </span>
                        </div>
                      )}
                      {(company.employees ||
                        editableCompanyData.employees > 0) && (
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">
                            Employees
                          </span>
                          <span className="font-medium text-lg">
                            {(
                              company.employees || editableCompanyData.employees
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {(company.headquarters ||
                        editableCompanyData.headquarters) && (
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">
                            Headquarters
                          </span>
                          <span className="font-medium text-lg">
                            {company.headquarters ||
                              editableCompanyData.headquarters}
                          </span>
                        </div>
                      )}
                      {(company.ceo || editableCompanyData.ceo) && (
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">CEO</span>
                          <span className="font-medium text-lg">
                            {company.ceo || editableCompanyData.ceo}
                          </span>
                        </div>
                      )}
                      {(company.founded || editableCompanyData.founded > 0) && (
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Founded</span>
                          <span className="font-medium text-lg">
                            {company.founded || editableCompanyData.founded}
                          </span>
                        </div>
                      )}
                      {(company.website || editableCompanyData.website) && (
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Website</span>
                          <a
                            href={
                              (
                                company.website || editableCompanyData.website
                              ).startsWith("http")
                                ? company.website || editableCompanyData.website
                                : `https://${
                                    company.website ||
                                    editableCompanyData.website
                                  }`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-lg text-primary hover:underline"
                          >
                            {company.website || editableCompanyData.website}
                          </a>
                        </div>
                      )}
                      {(company.estimatedDealValue ||
                        editableCompanyData.estimatedDealValue) && (
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground">
                            Estimated Deal Value
                          </span>
                          <span className="font-medium text-lg text-green-600">
                            {company.estimatedDealValue ||
                              editableCompanyData.estimatedDealValue}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">
                      Key Business Areas
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditingBusinessAreas(!isEditingBusinessAreas)
                      }
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditingBusinessAreas ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  {isEditingBusinessAreas ? (
                    <div className="space-y-4">
                      {editableBusinessAreas.map((area, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            value={area}
                            onChange={(e) =>
                              updateBusinessArea(index, e.target.value)
                            }
                            placeholder="Enter business area"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBusinessArea(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addBusinessArea}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Business Area
                      </Button>
                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={saveBusinessAreas}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {company.businessAreas?.length ||
                      editableBusinessAreas.length ? (
                        (company.businessAreas || editableBusinessAreas).map(
                          (area, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-2 rounded-lg bg-secondary/30"
                            >
                              <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                              <span className="text-base">{area}</span>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-muted-foreground">
                          No business areas specified
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">
                  Digital Twin Strategy
                </h3>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={() =>
                      generateDigitalTwinStrategyMutation.mutate({
                        id: company.id,
                        companyName: company.name,
                        industry: company.industry,
                      })
                    }
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
                <Card className="p-6 h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      Current Status
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingMaturity(!isEditingMaturity)}
                    >
                      <Edit3 className="w-3 h-3 mr-2" />
                      {isEditingMaturity ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">
                        Digital Twin Maturity
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getMaturityColor(
                              company.digitalTwinMaturity
                            )}`}
                            style={{
                              width: `${company.digitalTwinMaturity}%`,
                            }}
                          />
                        </div>
                        <span className="font-semibold">
                          {company.digitalTwinMaturity}%
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">
                        Implementation Stage
                      </div>
                      <Badge
                        className={
                          statusColors[
                            company.digitalTwinStatus as keyof typeof statusColors
                          ]
                        }
                      >
                        {
                          statusLabels[
                            company.digitalTwinStatus as keyof typeof statusLabels
                          ]
                        }
                      </Badge>
                    </div>
                  </div>

                  {/* Current Status Edit Modal */}
                  <Dialog
                    open={isEditingMaturity}
                    onOpenChange={setIsEditingMaturity}
                  >
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Edit Current Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Digital Twin Maturity (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editableMaturity}
                            onChange={(e) =>
                              setEditableMaturity(parseInt(e.target.value) || 0)
                            }
                            className="mt-1"
                          />
                          <div className="w-full bg-muted rounded-full h-3 mt-2">
                            <div
                              className={`h-3 rounded-full ${getMaturityColor(
                                editableMaturity
                              )}`}
                              style={{ width: `${editableMaturity}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Implementation Status
                          </label>
                          <Select
                            value={editableStatus}
                            onValueChange={(value) => {
                              console.log(
                                "Status selected:",
                                value,
                                typeof value
                              );
                              // Ensure we only accept valid string values
                              if (typeof value === "string" && value) {
                                setEditableStatus(value);
                              }
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">
                                Not Started
                              </SelectItem>
                              <SelectItem value="researching">
                                Researching
                              </SelectItem>
                              <SelectItem value="implementing">
                                Implementing
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-muted-foreground mt-1">
                            Current: {editableStatus}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingMaturity(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveMaturityAndStatus}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>

                {/* Key Initiatives */}
                <Card className="p-6 h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      Key Initiatives
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditingKeyInitiatives(!isEditingKeyInitiatives)
                      }
                    >
                      <Edit3 className="w-3 h-3 mr-2" />
                      {isEditingKeyInitiatives ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {editableKeyInitiatives.length > 0 ? (
                      editableKeyInitiatives.map((initiative, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm">{initiative}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic p-3 bg-secondary/30 rounded-lg">
                        No key initiatives specified
                      </div>
                    )}
                  </div>

                  {/* Key Initiatives Edit Modal */}
                  <Dialog
                    open={isEditingKeyInitiatives}
                    onOpenChange={setIsEditingKeyInitiatives}
                  >
                    <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Edit Key Initiatives</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto space-y-4 py-4">
                        {editableKeyInitiatives.map((initiative, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              value={initiative}
                              onChange={(e) =>
                                updateKeyInitiative(index, e.target.value)
                              }
                              placeholder="Enter key initiative"
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeKeyInitiative(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={addKeyInitiative}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Key Initiative
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingKeyInitiatives(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveKeyInitiatives}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>

                {/* Recommendations */}
                <Card className="p-6 h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      Recommendations
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditingRecommendations(!isEditingRecommendations)
                      }
                    >
                      <Edit3 className="w-3 h-3 mr-2" />
                      {isEditingRecommendations ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {editableRecommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          {recommendation.title}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {recommendation.description}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations Edit Modal */}
                  <Dialog
                    open={isEditingRecommendations}
                    onOpenChange={setIsEditingRecommendations}
                  >
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Edit Recommendations</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto space-y-4 py-4">
                        {editableRecommendations.map(
                          (recommendation, index) => (
                            <div
                              key={index}
                              className="space-y-2 p-4 border rounded-lg"
                            >
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={recommendation.title}
                                  onChange={(e) =>
                                    recommendationHelpers.updateTitle(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Recommendation title"
                                  className="font-medium"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    recommendationHelpers.remove(index)
                                  }
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <Textarea
                                value={recommendation.description}
                                onChange={(e) =>
                                  recommendationHelpers.updateDescription(
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Description"
                                rows={3}
                              />
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={recommendationHelpers.add}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Recommendation
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingRecommendations(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveRecommendations}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">
                    Detailed Strategy Analysis
                  </h4>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingStrategy(!isEditingStrategy)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingStrategy ? "Cancel Edit" : "Edit Analysis"}
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
                ) : company.digitalTwinStrategy || manualStrategy ? (
                  <div className="prose prose-base max-w-none">
                    <div className="text-base leading-relaxed p-4 bg-secondary/20 rounded-lg">
                      {renderMarkdownText(
                        company.digitalTwinStrategy || manualStrategy
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Kanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      No detailed strategy analysis available
                    </p>
                    <p className="text-sm mt-2">
                      Click &quot;Generate AI Strategy&quot; to create a
                      comprehensive analysis
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="dell-opportunity" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">
                  Dell Opportunity Assessment
                </h3>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={() =>
                      generateOpportunityAssessmentMutation.mutate({
                        id: company.id,
                        companyName: company.name,
                        industry: company.industry,
                      })
                    }
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
                <Card className="p-6 h-64 flex flex-col">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    Opportunity Score
                  </h4>
                  <div className="text-center py-6 flex-1 overflow-y-auto">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {(company.opportunityScore / 10).toFixed(1)}/10
                    </div>
                    <div className="flex justify-center space-x-1 mb-4">
                      {opportunityDots}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {company.opportunityScore >= 80 && "🔥 High Priority"}
                      {company.opportunityScore >= 60 &&
                        company.opportunityScore < 80 &&
                        "⚡ Medium Priority"}
                      {company.opportunityScore < 60 && "📋 Low Priority"}
                    </div>
                  </div>
                </Card>

                {/* Deal Potential */}
                <Card className="p-6 h-64 flex flex-col">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Deal Potential
                  </h4>
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">
                        Estimated Deal Value
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {company.estimatedDealValue || "TBD"}
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">
                        Company Size
                      </div>
                      <div className="text-lg font-semibold">
                        {company.employees
                          ? `${company.employees.toLocaleString()} employees`
                          : "Size not specified"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {company.revenue || "Revenue not specified"}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pain Points */}
                <Card className="p-6 h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      Pain Points
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditingPainPoints(!isEditingPainPoints)
                      }
                    >
                      <Edit3 className="w-3 h-3 mr-2" />
                      {isEditingPainPoints ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  {isEditingPainPoints ? (
                    <div className="space-y-4">
                      {editablePainPoints.map((point, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <Input
                              value={point.title}
                              onChange={(e) =>
                                painPointHelpers.updateTitle(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Pain point title"
                              className="font-medium"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => painPointHelpers.remove(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            value={point.description}
                            onChange={(e) =>
                              painPointHelpers.updateDescription(
                                index,
                                e.target.value
                              )
                            }
                            placeholder="Description"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={painPointHelpers.add}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Pain Point
                      </Button>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingPainPoints(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={savePainPoints}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {editablePainPoints.map((point, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                        >
                          <div className="text-sm font-medium text-red-800 dark:text-red-200">
                            {point.title}
                          </div>
                          <div className="text-sm text-red-600 dark:text-red-300 mt-1">
                            {point.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pain Points Edit Modal */}
                  <Dialog
                    open={isEditingPainPoints}
                    onOpenChange={setIsEditingPainPoints}
                  >
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Edit Pain Points</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto space-y-4 py-4">
                        {editablePainPoints.map((point, index) => (
                          <div
                            key={index}
                            className="space-y-2 p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Input
                                value={point.title}
                                onChange={(e) =>
                                  painPointHelpers.updateTitle(
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Pain point title"
                                className="font-medium"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => painPointHelpers.remove(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <Textarea
                              value={point.description}
                              onChange={(e) =>
                                painPointHelpers.updateDescription(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Description"
                              rows={3}
                            />
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={painPointHelpers.add}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Pain Point
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingPainPoints(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={savePainPoints}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>

                {/* Dell Solutions */}
                <Card className="p-6 h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      Dell Solutions
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditingDellSolutions(!isEditingDellSolutions)
                      }
                    >
                      <Edit3 className="w-3 h-3 mr-2" />
                      {isEditingDellSolutions ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {editableDellSolutions.map((solution, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {solution.title}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          {solution.description}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dell Solutions Edit Modal */}
                  <Dialog
                    open={isEditingDellSolutions}
                    onOpenChange={setIsEditingDellSolutions}
                  >
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Edit Dell Solutions</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto space-y-4 py-4">
                        {editableDellSolutions.map((solution, index) => (
                          <div
                            key={index}
                            className="space-y-2 p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Input
                                value={solution.title}
                                onChange={(e) =>
                                  dellSolutionHelpers.updateTitle(
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Solution title"
                                className="font-medium"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  dellSolutionHelpers.remove(index)
                                }
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <Textarea
                              value={solution.description}
                              onChange={(e) =>
                                dellSolutionHelpers.updateDescription(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Description"
                              rows={3}
                            />
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={dellSolutionHelpers.add}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Solution
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingDellSolutions(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveDellSolutions}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>

                {/* Next Steps */}
                <Card className="p-6 h-96 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      Next Steps
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingNextSteps(!isEditingNextSteps)}
                    >
                      <Edit3 className="w-3 h-3 mr-2" />
                      {isEditingNextSteps ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {editableNextSteps.map((step, index) => (
                      <div
                        key={index}
                        className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                      >
                        <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          {step.title}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                          {step.description}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Steps Edit Modal */}
                  <Dialog
                    open={isEditingNextSteps}
                    onOpenChange={setIsEditingNextSteps}
                  >
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Edit Next Steps</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto space-y-4 py-4">
                        {editableNextSteps.map((step, index) => (
                          <div
                            key={index}
                            className="space-y-2 p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Input
                                value={step.title}
                                onChange={(e) =>
                                  nextStepHelpers.updateTitle(
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Step title"
                                className="font-medium"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => nextStepHelpers.remove(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <Textarea
                              value={step.description}
                              onChange={(e) =>
                                nextStepHelpers.updateDescription(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Description"
                              rows={3}
                            />
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={nextStepHelpers.add}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Step
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingNextSteps(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveNextSteps}
                          disabled={updateCompanyMutation.isPending}
                        >
                          {updateCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>
              </div>

              {/* Detailed Assessment */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">
                    Detailed Assessment Notes
                  </h4>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setIsEditingOpportunity(!isEditingOpportunity)
                    }
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingOpportunity ? "Cancel Edit" : "Edit Notes"}
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
                ) : company.dellOpportunity || manualOpportunity ? (
                  <div className="prose prose-base max-w-none">
                    <div className="text-base leading-relaxed p-4 bg-secondary/20 rounded-lg">
                      {renderMarkdownText(
                        company.dellOpportunity || manualOpportunity
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No detailed assessment available</p>
                    <p className="text-sm mt-2">
                      Click &quot;Generate AI Assessment&quot; for comprehensive
                      Dell opportunity analysis
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ISV Partners Tab */}
            <TabsContent value="isv-partners" className="space-y-6">
              <ISVPartnersTab companyId={company.id} company={company as any} />
            </TabsContent>

            <TabsContent value="personnel" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Key Personnel</h3>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPersonnel(!isEditingPersonnel)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingPersonnel ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </div>

              <Card className="p-6">
                {isEditingPersonnel ? (
                  <div className="space-y-4">
                    {editablePersonnel.map((p, index) => (
                      <div
                        key={index}
                        className="space-y-3 p-4 border rounded-lg"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            value={p.name}
                            onChange={(e) =>
                              updatePersonnelField(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Full name"
                          />
                          <Input
                            value={p.title}
                            onChange={(e) =>
                              updatePersonnelField(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Job title"
                          />
                          <Input
                            value={p.email || ""}
                            onChange={(e) =>
                              updatePersonnelField(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                            placeholder="Email"
                          />
                          <Input
                            value={p.phone || ""}
                            onChange={(e) =>
                              updatePersonnelField(
                                index,
                                "phone",
                                e.target.value
                              )
                            }
                            placeholder="Phone"
                          />
                        </div>
                        <Textarea
                          value={p.notes || ""}
                          onChange={(e) =>
                            updatePersonnelField(index, "notes", e.target.value)
                          }
                          placeholder="Notes (e.g., involvement in digital twin, interests, responsibilities)"
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePersonnel(index)}
                          >
                            <X className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={addPersonnel}>
                        <Plus className="w-4 h-4 mr-2" /> Add Person
                      </Button>
                      <Button
                        onClick={savePersonnel}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(company as any).personnel &&
                    (company as any).personnel.length > 0 ? (
                      (company as any).personnel.map(
                        (p: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg bg-secondary/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-card-foreground">
                                {p.name}
                              </div>
                              <Badge>{p.title}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {p.email && (
                                <span className="mr-3">{p.email}</span>
                              )}
                              {p.phone && <span>{p.phone}</span>}
                            </div>
                            {p.notes && (
                              <div className="text-sm mt-2">{p.notes}</div>
                            )}
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-muted-foreground">
                        No personnel added
                      </p>
                    )}
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
