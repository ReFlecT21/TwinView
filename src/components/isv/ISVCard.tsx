import { ISVStartup, ValueChainStage } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Globe,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Star,
  ArrowRight,
  Layers,
  Database,
  Cpu,
  HardDrive,
  Brain,
  Monitor,
} from "lucide-react";

interface ISVCardProps {
  isv: ISVStartup;
  onViewDetails: () => void;
  onMatchPartners?: () => void;
}

const getInterestColor = (level?: string) => {
  switch (level) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "low":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    case "growing":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getVerticalIcon = (vertical: string) => {
  switch (vertical) {
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

const getValueChainStageInfo = (stage: ValueChainStage) => {
  switch (stage) {
    case ValueChainStage.DATA_CAPTURE_INGESTION:
      return { icon: Database, label: "Data Capture", color: "text-blue-600" };
    case ValueChainStage.EDGE_PROCESSING:
      return { icon: Cpu, label: "Edge", color: "text-purple-600" };
    case ValueChainStage.STORAGE_MANAGEMENT:
      return { icon: HardDrive, label: "Storage", color: "text-green-600" };
    case ValueChainStage.COMPUTE_SIMULATION:
      return { icon: Brain, label: "Compute", color: "text-orange-600" };
    case ValueChainStage.VISUALIZATION_DECISION:
      return { icon: Monitor, label: "Visualization", color: "text-indigo-600" };
    default:
      return { icon: Layers, label: "Unknown", color: "text-gray-600" };
  }
};

export function ISVCard({ isv, onViewDetails, onMatchPartners }: ISVCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getVerticalIcon(isv.vertical)}</div>
            <div>
              <h3 className="font-semibold text-lg">{isv.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {isv.vertical.replace("_", " ")}
                </Badge>
                {isv.size && (
                  <Badge variant="secondary" className="text-xs">
                    {isv.size}
                  </Badge>
                )}
                {isv.maturityStage && (
                  <Badge variant="secondary" className="text-xs">
                    {isv.maturityStage}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isv.interestLevel && (
            <Badge className={getInterestColor(isv.interestLevel)}>
              {isv.interestLevel === "high" ? "🔴" : isv.interestLevel === "medium" ? "🟡" : "🟢"} {isv.interestLevel}
            </Badge>
          )}
        </div>

        {/* Location & Presence */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">HQ:</span>
            <span>{isv.headquarters || "Global"}</span>
          </div>
          {isv.presence && isv.presence.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Presence:</span>
              <span>{isv.presence.length} countries</span>
            </div>
          )}
          {isv.employees && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Size:</span>
              <span>{isv.employees.toLocaleString()} employees</span>
            </div>
          )}
          {isv.accounts && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Accounts:</span>
              <span>{isv.accounts.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Value Chain Coverage */}
        {isv.valueChainStages && isv.valueChainStages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers className="w-4 h-4" />
              <span>Value Chain Coverage ({isv.valueChainStages.length}/5)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {isv.valueChainStages.map(stage => {
                const stageInfo = getValueChainStageInfo(stage);
                const StageIcon = stageInfo.icon;
                return (
                  <Badge key={stage} variant="secondary" className="text-xs flex items-center gap-1">
                    <StageIcon className={`w-3 h-3 ${stageInfo.color}`} />
                    <span>{stageInfo.label}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Openness & Compatibility */}
        <div className="space-y-2 p-3 bg-secondary/30 rounded-lg">
          <div className="font-medium text-sm mb-2">Openness & Compatibility</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm">
              {isv.hasOpenAPIs ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span>Open APIs</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isv.dellValidated ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span>Dell Validated</span>
            </div>
          </div>
          {isv.integrations && isv.integrations.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Integrations:</div>
              <div className="flex flex-wrap gap-1">
                {isv.integrations.slice(0, 3).map((integration, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {integration}
                  </Badge>
                ))}
                {isv.integrations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{isv.integrations.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interest Reasons */}
        {isv.interestReasons && isv.interestReasons.length > 0 && (
          <div className="space-y-1">
            <div className="font-medium text-sm">Why Interesting:</div>
            {isv.interestReasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Star className="w-3 h-3 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Case Studies */}
        {isv.caseStudies && isv.caseStudies.length > 0 && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xs font-medium text-blue-900 dark:text-blue-100">
              📚 {isv.caseStudies.length} Case {isv.caseStudies.length === 1 ? "Study" : "Studies"}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {isv.caseStudies[0].title}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={onViewDetails} className="flex-1">
            View Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {onMatchPartners && (
            <Button onClick={onMatchPartners} variant="outline" className="flex-1">
              Match Partners
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}