import { Card } from "@/components/ui/card";
import { Building2, Zap, Star, DollarSign } from "lucide-react";

interface KPICardsProps {
  analytics: {
    totalPartners: number;
    activeProjects: number;
    highOpportunityCount: number;
    pipelineValue: string;
  };
}

export default function KPICards({ analytics }: KPICardsProps) {
  const kpiData = [
    {
      title: "Total Partners",
      value: analytics.totalPartners,
      icon: Building2,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      change: "+12%",
      changeText: "vs last quarter"
    },
    {
      title: "Active Digital Twin Projects",
      value: analytics.activeProjects,
      icon: Zap,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      change: "+8%",
      changeText: "vs last quarter"
    },
    {
      title: "High Opportunity Score",
      value: analytics.highOpportunityCount,
      icon: Star,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      change: "+15%",
      changeText: "vs last quarter"
    },
    {
      title: "Pipeline Value",
      value: analytics.pipelineValue,
      icon: DollarSign,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      change: "+23%",
      changeText: "vs last quarter"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
              <p className="text-3xl font-bold text-card-foreground" data-testid={`kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {kpi.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
              <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">{kpi.change}</span>
            <span className="text-muted-foreground ml-2">{kpi.changeText}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
