import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Header from "@/components/layout/header";
import { ISVCard } from "@/components/isv/ISVCard";
import { AddISVDialog } from "@/components/isv/AddISVDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISVStartup, isvVerticals, isvSizes, isvInterestLevels } from "@shared/schema";
import { trpc } from "@/lib/trpc";
import {
  MapPin,
  Globe2,
  Factory,
  Building,
  Heart,
  Search,
  Plus,
  Grid3x3,
  Map,
  Filter,
  Download,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dynamic import for the map component to avoid SSR issues
const ISVMap = dynamic(
  () => import("@/components/isv/ISVMap").then((mod) => mod.ISVMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[500px] w-full" />,
  }
);

export default function ISVStartupsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"map" | "grid" | "vertical">("map");
  const [selectedVertical, setSelectedVertical] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [selectedInterest, setSelectedInterest] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch ISV data
  const { data: isvStartups = [], isLoading } = trpc.isvStartups.getAll.useQuery({
    vertical: selectedVertical !== "all" ? selectedVertical as any : undefined,
    size: selectedSize !== "all" ? selectedSize as any : undefined,
    interestLevel: selectedInterest !== "all" ? selectedInterest as any : undefined,
    search: searchQuery || undefined,
  });

  // Fetch vertical counts
  const { data: verticalCounts } = trpc.isvStartups.getByVertical.useQuery();

  const handleISVClick = (isv: ISVStartup) => {
    router.push(`/isv/${isv.id}`);
  };

  const handleAddISV = () => {
    setIsAddDialogOpen(true);
  };

  // Quick add sample ISVs function
  const utils = trpc.useUtils();
  const createISV = trpc.isvStartups.create.useMutation({
    onSuccess: () => {
      utils.isvStartups.getAll.invalidate();
      utils.isvStartups.getByVertical.invalidate();
    },
  });

  const quickAddSampleISVs = async () => {
    const sampleISVs = [
      {
        name: "Biofourmis",
        vertical: "healthcare" as const,
        headquarters: "Singapore",
        presence: ["Singapore", "USA", "India"],
        regions: ["APAC" as const],
        size: "medium" as const,
        maturityStage: "Growth" as const,
        employees: 300,
        revenue: "$300M",
        hasOpenAPIs: true,
        dellValidated: false,
        interestLevel: "high" as const,
        integrations: ["Biovitals"],
        notes: "Growth-Stage ISV/has raised over $300M, partnerships with top hospitals. Platform seems open. For remote patient monitoring and digital therapeutics.",
        coordinates: { lat: 1.3521, lng: 103.8198 }, // Singapore coordinates
      },
      {
        name: "Qure.ai",
        vertical: "healthcare" as const,
        headquarters: "Mumbai, India",
        presence: ["India", "USA", "UK"],
        regions: ["APAC" as const, "EMEA" as const],
        size: "medium" as const,
        maturityStage: "Growth" as const,
        employees: 80,
        revenue: "",
        hasOpenAPIs: false,
        dellValidated: true,
        interestLevel: "high" as const,
        integrations: [],
        notes: "Scale-up stage; founded 2016; Series C preparing IPO (2025). Used in 80+ countries. AI models are PACS/RIS compatible; cloud-based, likely server-agnostic. Seems to fits Dell hardware. Strong Indian footprint, global recognition in AI imaging—good for TCS",
        coordinates: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
      },
    ];

    for (const isvData of sampleISVs) {
      try {
        await createISV.mutateAsync(isvData);
        toast({
          title: "ISV Added",
          description: `${isvData.name} has been added successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error adding ISV",
          description: `Failed to add ${isvData.name}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "ISV/Startup report is being generated...",
    });
  };

  // Group ISVs by vertical
  const groupedByVertical = isvStartups.reduce((acc, isv) => {
    if (!acc[isv.vertical]) {
      acc[isv.vertical] = [];
    }
    acc[isv.vertical].push(isv);
    return acc;
  }, {} as Record<string, ISVStartup[]>);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="ISV & Startup Ecosystem"
        description="Explore and evaluate potential ISV and startup partners across verticals"
        actionButton={
          <div className="flex gap-3">
            {isvStartups.length === 0 && (
              <Button variant="outline" onClick={quickAddSampleISVs}>
                <Sparkles className="w-4 h-4 mr-2" />
                Add Sample ISVs
              </Button>
            )}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={handleAddISV}>
              <Plus className="w-4 h-4 mr-2" />
              Add ISV/Startup
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ISVs</p>
                <p className="text-2xl font-bold">{isvStartups.length}</p>
              </div>
              <Globe2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Manufacturing</p>
                <p className="text-2xl font-bold">{verticalCounts?.manufacturing || 0}</p>
              </div>
              <Factory className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Smart Cities</p>
                <p className="text-2xl font-bold">{verticalCounts?.smartCities || 0}</p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Healthcare</p>
                <p className="text-2xl font-bold">{verticalCounts?.healthcare || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[250px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ISV/Startup..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select value={selectedVertical} onValueChange={setSelectedVertical}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Verticals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verticals</SelectItem>
                {isvVerticals.map((vertical) => (
                  <SelectItem key={vertical} value={vertical}>
                    {vertical.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {isvSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedInterest} onValueChange={setSelectedInterest}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interest</SelectItem>
                {isvInterestLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex rounded-lg bg-muted p-1 ml-auto">
              <Button
                variant={activeView === "map" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView("map")}
                className="px-3"
              >
                <Map className="w-4 h-4" />
              </Button>
              <Button
                variant={activeView === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView("grid")}
                className="px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={activeView === "vertical" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveView("vertical")}
                className="px-3"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px]" />
            ))}
          </div>
        ) : (
          <>
            {activeView === "map" && (
              <ISVMap
                isvStartups={isvStartups}
                selectedVertical={selectedVertical !== "all" ? selectedVertical : undefined}
                onISVClick={handleISVClick}
              />
            )}

            {activeView === "grid" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {isvStartups.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">No ISV/Startups found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Adjust filters or add new ISV/Startup
                    </p>
                  </div>
                ) : (
                  isvStartups.map((isv) => (
                    <ISVCard
                      key={isv.id}
                      isv={isv}
                      onViewDetails={() => handleISVClick(isv)}
                      onMatchPartners={() => router.push(`/isv/${isv.id}/match`)}
                    />
                  ))
                )}
              </div>
            )}

            {activeView === "vertical" && (
              <div className="space-y-6">
                {Object.entries(groupedByVertical).map(([vertical, isvs]) => (
                  <Card key={vertical} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {vertical === "manufacturing" ? "🏭" :
                           vertical === "smart_cities" ? "🏙️" :
                           vertical === "healthcare" ? "🏥" : "🏢"}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold capitalize">
                            {vertical.replace("_", " ")}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isvs.length} companies
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedVertical(vertical);
                          setActiveView("grid");
                        }}
                      >
                        View All
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {isvs.slice(0, 3).map((isv) => (
                        <div
                          key={isv.id}
                          className="p-4 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50"
                          onClick={() => handleISVClick(isv)}
                        >
                          <div className="font-medium">{isv.name}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {isv.size}
                            </Badge>
                            {isv.interestLevel && (
                              <Badge
                                className={`text-xs ${
                                  isv.interestLevel === "high"
                                    ? "bg-red-100 text-red-800"
                                    : isv.interestLevel === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {isv.interestLevel}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {isv.headquarters}
                          </p>
                        </div>
                      ))}
                    </div>

                    {isvs.length > 3 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVertical(vertical);
                            setActiveView("grid");
                          }}
                        >
                          +{isvs.length - 3} more companies
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add ISV Dialog */}
      <AddISVDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}