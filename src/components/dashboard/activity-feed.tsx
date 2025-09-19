import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const activityColors = {
  company_created: "bg-green-500",
  company_updated: "bg-blue-500",
  competitive_analysis_generated: "bg-purple-500",
  opportunity_assessment_generated: "bg-orange-500",
  digital_twin_strategy_generated: "bg-indigo-500",
  default: "bg-gray-500"
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Activity</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="button-view-all-activity">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity</p>
        ) : (
          activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
              <div 
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activityColors[activity.action as keyof typeof activityColors] || activityColors.default
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">{activity.userName}</span> {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp!))} ago
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
