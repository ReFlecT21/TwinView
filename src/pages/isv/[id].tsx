import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  MapPin,
  Globe,
  Users,
  Building2,
  TrendingUp,
  Link2,
  CheckCircle,
  Shield,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ISVDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const { data: isv, isLoading } = trpc.isvStartups.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const utils = trpc.useUtils();
  const deleteISV = trpc.isvStartups.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "ISV Deleted",
        description: "The ISV has been deleted successfully.",
      });
      router.push("/isv-startups");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this ISV?")) {
      deleteISV.mutate({ id: id as string });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="" description="" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!isv) {
    return (
      <div className="flex flex-col h-full">
        <Header title="ISV Not Found" description="" />
        <div className="p-6">
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              The ISV/Startup you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/isv-startups")}>
              Back to ISVs
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const getVerticalIcon = () => {
    switch (isv.vertical) {
      case "manufacturing":
        return "🏭";
      case "smart_cities":
        return "🏙️";
      case "healthcare":
        return "🏥";
      default:
        return "🏢";
    }
  };

  const getInterestColor = (level: string | null | undefined) => {
    if (!level) return "";
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      case "growing":
        return "bg-blue-100 text-blue-800";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={isv.name}
        description={`${isv.vertical.replace("_", " ")} ISV/Startup`}
        actionButton={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/isv-startups")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to ISVs
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Overview Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{getVerticalIcon()}</div>
                <div>
                  <h2 className="text-2xl font-semibold">{isv.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {isv.vertical.replace("_", " ")}
                    </Badge>
                    {isv.size && (
                      <Badge variant="secondary">{isv.size}</Badge>
                    )}
                    {isv.maturityStage && (
                      <Badge variant="secondary">{isv.maturityStage}</Badge>
                    )}
                    {isv.interestLevel && (
                      <Badge className={getInterestColor(isv.interestLevel)}>
                        {isv.interestLevel} interest
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isv.headquarters && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">HQ: {isv.headquarters}</span>
                </div>
              )}
              {isv.employees && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{isv.employees.toLocaleString()} employees</span>
                </div>
              )}
              {isv.revenue && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Revenue: {isv.revenue}</span>
                </div>
              )}
              {isv.presence && isv.presence.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Present in {isv.presence.length} countries</span>
                </div>
              )}
              {isv.hasOpenAPIs && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Open APIs Available</span>
                </div>
              )}
              {isv.dellValidated && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Dell Validated</span>
                </div>
              )}
            </div>
          </Card>

          {/* Geographic Presence */}
          {(isv.presence && isv.presence.length > 0) || (isv.regions && isv.regions.length > 0) ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Geographic Presence</h3>
              <div className="space-y-3">
                {isv.regions && isv.regions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Regions</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.regions.map((region) => (
                        <Badge key={region} variant="outline">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {isv.presence && isv.presence.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Countries</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.presence.map((country) => (
                        <Badge key={country} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : null}

          {/* Integrations & Partnerships */}
          {(isv.integrations && isv.integrations.length > 0) ||
           (isv.consortiumMemberships && isv.consortiumMemberships.length > 0) ||
           (isv.certifications && isv.certifications.length > 0) ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Integrations & Partnerships</h3>
              <div className="space-y-3">
                {isv.integrations && isv.integrations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Integrations</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.integrations.map((integration) => (
                        <Badge key={integration} variant="outline">
                          <Link2 className="w-3 h-3 mr-1" />
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {isv.consortiumMemberships && isv.consortiumMemberships.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Consortium Memberships</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.consortiumMemberships.map((membership) => (
                        <Badge key={membership} variant="secondary">
                          {membership}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {isv.certifications && isv.certifications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : null}

          {/* Notes */}
          {isv.notes && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {isv.notes}
              </p>
            </Card>
          )}

          {/* Case Studies */}
          {isv.caseStudies && Array.isArray(isv.caseStudies) && isv.caseStudies.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Case Studies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(isv.caseStudies as any[]).map((study, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="font-medium mb-1">{study.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{study.location}</p>
                    <p className="text-sm">{study.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Strategic Value */}
          {(isv.strategicValue || isv.interestReasons) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Strategic Assessment</h3>
              {isv.strategicValue && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Strategic Value</p>
                  <p className="text-sm">{isv.strategicValue}</p>
                </div>
              )}
              {isv.interestReasons && isv.interestReasons.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Interest Reasons</p>
                  <div className="flex flex-wrap gap-2">
                    {isv.interestReasons.map((reason) => (
                      <Badge key={reason} variant="outline">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}