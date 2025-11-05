import { useState, useEffect } from "react";
import { Company, ISVStartup } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  Globe,
  Link,
  TrendingUp,
  Users,
  CheckCircle,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/router";

interface ISVPartnersTabProps {
  companyId: string;
  company: Company;
}

export function ISVPartnersTab({ companyId, company }: ISVPartnersTabProps) {
  const router = useRouter();
  const [selectedVertical, setSelectedVertical] = useState<string>("all");

  // Fetch all ISVs
  const { data: allISVs = [], isLoading: isLoadingISVs } = trpc.isvStartups.getAll.useQuery({
    vertical: selectedVertical !== "all" ? selectedVertical as any : undefined,
  });

  // Calculate synergy scores for each ISV
  const calculateSynergy = (isv: ISVStartup): number => {
    let score = 0;
    const reasons: string[] = [];

    // Industry alignment
    if (company.industry === "Manufacturing" && isv.vertical === "manufacturing") {
      score += 25;
    } else if (company.industry === "Healthcare" && isv.vertical === "healthcare") {
      score += 25;
    } else if ((company.industry === "Technology" || company.industry === "Energy") && isv.vertical === "smart_cities") {
      score += 20;
    }

    // Geographic overlap
    if (isv.presence?.includes(company.country)) {
      score += 20;
    }

    // Size compatibility
    if (company.employees && company.employees > 50000 && (isv.size === "large" || isv.size === "enterprise")) {
      score += 15;
    }

    // Digital transformation alignment
    if ((company.digitalTwinStatus === "implementing" || company.digitalTwinStatus === "completed") && isv.hasOpenAPIs) {
      score += 20;
    }

    // High scoring companies bonus
    if (company.scores?.totalScore && company.scores.totalScore > 4) {
      score += 10;
    }

    // Dell validation bonus
    if (isv.dellValidated) {
      score += 10;
    }

    return Math.min(score, 100);
  };

  // Sort ISVs by synergy score
  const sortedISVs = allISVs
    .map((isv) => ({
      ...isv,
      synergyScore: calculateSynergy(isv),
    }))
    .sort((a, b) => b.synergyScore - a.synergyScore)
    .slice(0, 10); // Top 10 matches

  const getSynergyColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getSynergyLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Low Match";
  };

  if (isLoadingISVs) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[150px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Recommended ISV Partners</h3>
          <p className="text-muted-foreground mt-1">
            ISV and startup partners matched based on synergy with {company.name}
          </p>
        </div>
        <Select value={selectedVertical} onValueChange={setSelectedVertical}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Verticals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="smart_cities">Smart Cities</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matched ISVs */}
      {sortedISVs.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No ISV partners found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add ISVs to the system to see partnership recommendations
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/isv-startups")}
          >
            Browse ISV Ecosystem
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedISVs.map((isv) => (
            <Card key={isv.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">
                      {isv.vertical === "manufacturing" ? "🏭" :
                       isv.vertical === "smart_cities" ? "🏙️" :
                       isv.vertical === "healthcare" ? "🏥" : "🏢"}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{isv.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {isv.vertical.replace("_", " ")}
                        </Badge>
                        {isv.size && (
                          <Badge variant="secondary" className="text-xs">
                            {isv.size}
                          </Badge>
                        )}
                        {isv.dellValidated && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Dell Validated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{isv.headquarters || "Global"}</span>
                      </div>
                      {isv.presence && isv.presence.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span>{isv.presence.length} countries</span>
                        </div>
                      )}
                      {isv.employees && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{isv.employees.toLocaleString()} employees</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {isv.hasOpenAPIs && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Open APIs Available</span>
                        </div>
                      )}
                      {isv.integrations && isv.integrations.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Link className="w-4 h-4 text-muted-foreground" />
                          <span>{isv.integrations.length} integrations</span>
                        </div>
                      )}
                      {isv.caseStudies && isv.caseStudies.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <span>{isv.caseStudies.length} case studies</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Why this partnership makes sense:</div>
                    <div className="flex flex-wrap gap-2">
                      {company.industry === isv.vertical && (
                        <Badge variant="secondary" className="text-xs">
                          Industry Alignment
                        </Badge>
                      )}
                      {isv.presence?.includes(company.country) && (
                        <Badge variant="secondary" className="text-xs">
                          Geographic Overlap
                        </Badge>
                      )}
                      {isv.dellValidated && (
                        <Badge variant="secondary" className="text-xs">
                          Dell Ecosystem
                        </Badge>
                      )}
                      {isv.hasOpenAPIs && (
                        <Badge variant="secondary" className="text-xs">
                          Integration Ready
                        </Badge>
                      )}
                      {company.digitalTwinStatus === "implementing" && (
                        <Badge variant="secondary" className="text-xs">
                          Digital Twin Synergy
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Synergy Score */}
                <div className="ml-6 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Synergy</div>
                  <div className={`text-3xl font-bold ${getSynergyColor(isv.synergyScore)}`}>
                    {isv.synergyScore}%
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {getSynergyLabel(isv.synergyScore)}
                  </Badge>
                  <Button
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => router.push(`/isv/${isv.id}`)}
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold mb-1">Explore More ISV Partners</h4>
            <p className="text-sm text-muted-foreground">
              Discover additional ISV and startup partners in the ecosystem
            </p>
          </div>
          <Button onClick={() => router.push("/isv-startups")}>
            <Globe className="w-4 h-4 mr-2" />
            Browse All ISVs
          </Button>
        </div>
      </Card>
    </div>
  );
}