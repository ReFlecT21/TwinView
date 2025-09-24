import { Card } from "@/components/ui/card";
import { Building2, Zap, Star, DollarSign } from "lucide-react";

interface KPICardsProps {
  analytics: {
    totalPartners: number;
    activeProjects: number;
    highOpportunityCount: number;
    pipelineValue: string;
    teamMembersCount?: number;
    totalActivities?: number;
    aiAnalysesCount?: number;
  };
}

export default function KPICards({ analytics }: KPICardsProps) {

  const kpiData = [
    {
      title: "Team Members",
      value: analytics.teamMembersCount || 1,
      icon: Building2,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      status: { text: "All members engaged", color: "text-green-500" }
    },
    {
      title: "Total Activities",
      value: analytics.totalActivities || 7,
      icon: Zap,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      status: { text: "vs last month", color: "text-green-500" }
    },
    {
      title: "Companies Managed",
      value: analytics.totalPartners,
      icon: Star,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      status: { text: "new additions", color: "text-green-500" }
    },
    {
      title: "AI Analyses",
      value: analytics.aiAnalysesCount || 1,
      icon: DollarSign,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      status: { text: "AI utilization", color: "text-green-500" }
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
            <span className={`font-medium ${kpi.status.color}`}>{kpi.status.text}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
