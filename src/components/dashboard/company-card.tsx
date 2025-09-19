import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Company } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface CompanyCardProps {
  company: Company;
  onClick: () => void;
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

const maturityColors = {
  low: "bg-red-500",
  medium: "bg-yellow-500",
  high: "bg-green-500",
  complete: "bg-blue-500"
};

function getMaturityColor(maturity: number) {
  if (maturity < 30) return maturityColors.low;
  if (maturity < 60) return maturityColors.medium;
  if (maturity < 90) return maturityColors.high;
  return maturityColors.complete;
}

function getCompanyInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const opportunityDots = Array.from({ length: 10 }, (_, i) => (
    <div
      key={i}
      className={`w-2 h-2 rounded-full ${
        i < Math.floor(company.opportunityScore / 10) 
          ? "bg-yellow-500" 
          : "bg-muted"
      }`}
    />
  ));

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
      data-testid={`company-card-${company.id}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                {getCompanyInitials(company.name)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground text-lg" data-testid={`company-name-${company.id}`}>
                {company.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {company.industry} • {company.country}
              </p>
            </div>
          </div>
          <Badge 
            className={statusColors[company.digitalTwinStatus as keyof typeof statusColors]}
            data-testid={`company-status-${company.id}`}
          >
            {statusLabels[company.digitalTwinStatus as keyof typeof statusLabels]}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Digital Twin Maturity</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getMaturityColor(company.digitalTwinMaturity)}`}
                  style={{ width: `${company.digitalTwinMaturity}%` }}
                />
              </div>
              <span className="text-sm font-medium" data-testid={`company-maturity-${company.id}`}>
                {company.digitalTwinMaturity}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Opportunity Score</span>
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                {opportunityDots}
              </div>
              <span className="text-sm font-medium ml-2" data-testid={`company-opportunity-${company.id}`}>
                {(company.opportunityScore / 10).toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Est. Deal Value</span>
            <span className="text-sm font-medium text-card-foreground" data-testid={`company-deal-value-${company.id}`}>
              {company.estimatedDealValue || "TBD"}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Last updated: {formatDistanceToNow(new Date(company.lastUpdated!))} ago
            </span>
            {company.nextFollowUp && (
              <span>
                Next follow-up: {new Date(company.nextFollowUp).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
