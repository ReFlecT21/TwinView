import { useState } from "react";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamMemberSchema, TeamMember } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Mail, 
  Calendar,
  Activity,
  Users,
  TrendingUp,
  FileText,
  User,
  Building2,
  Target,
  Brain
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Team() {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: teamMembers = [], isLoading: membersLoading } = trpc.teamMembers.getAll.useQuery();
  const { data: activities = [], isLoading: activitiesLoading } = trpc.activityLogs.getAll.useQuery();
  const { data: companies = [], isLoading: companiesLoading } = trpc.companies.getAll.useQuery({});

  const form = useForm({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
    },
  });

  const createMemberMutation = trpc.teamMembers.create.useMutation({
    onSuccess: () => {
      utils.teamMembers.getAll.invalidate();
      toast({
        title: "Team Member Added",
        description: "New team member has been successfully added.",
      });
      form.reset();
      setIsAddMemberOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add team member: " + (error as unknown as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createMemberMutation.mutate(data);
  };

  const handleExportTeamReport = () => {
    console.log("Export team report clicked");
    // TODO: Implement actual export functionality
  };

  // Calculate team performance metrics
  const teamActivityStats = activities.reduce((stats: any, activity: any) => {
    const userName = activity.userName;
    if (!stats[userName]) {
      stats[userName] = {
        totalActivities: 0,
        companiesUpdated: 0,
        analysesGenerated: 0,
        lastActive: activity.timestamp,
      };
    }
    stats[userName].totalActivities++;
    if (activity.action === 'company_updated') stats[userName].companiesUpdated++;
    if (activity.action.includes('generated')) stats[userName].analysesGenerated++;
    if (new Date(activity.timestamp) > new Date(stats[userName].lastActive)) {
      stats[userName].lastActive = activity.timestamp;
    }
    return stats;
  }, {});

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'senior sales engineer':
      case 'solutions architect':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'business development manager':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'digital twin specialist':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'company_created':
        return <Building2 className="w-4 h-4" />;
      case 'company_updated':
        return <FileText className="w-4 h-4" />;
      case 'competitive_analysis_generated':
      case 'opportunity_assessment_generated':
      case 'digital_twin_strategy_generated':
        return <Brain className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Team"
        description="Manage team members and track collaborative contributions"
        onExportReport={handleExportTeamReport}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-3xl font-bold text-card-foreground" data-testid="team-member-count">
                  {teamMembers.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
              <span className="text-muted-foreground ml-2">All members engaged</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-3xl font-bold text-card-foreground" data-testid="total-activities">
                  {activities.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">+24%</span>
              <span className="text-muted-foreground ml-2">vs last month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Companies Managed</p>
                <p className="text-3xl font-bold text-card-foreground" data-testid="companies-managed">
                  {companies.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
              <span className="text-muted-foreground ml-2">new additions</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Analyses</p>
                <p className="text-3xl font-bold text-card-foreground" data-testid="ai-analyses-count">
                  {activities.filter(a => a.action.includes('generated')).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">+45%</span>
              <span className="text-muted-foreground ml-2">AI utilization</span>
            </div>
          </Card>
        </div>

        {/* Team Members */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Team Members</h3>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-team-member">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="add-member-modal">
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sarah Chen" {...field} data-testid="input-member-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="e.g., sarah.chen@dell.com" 
                              {...field}
                              data-testid="input-member-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Senior Sales Engineer" 
                              {...field}
                              data-testid="input-member-role"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-member-department">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pre-Sales">Pre-Sales</SelectItem>
                              <SelectItem value="Technical Sales">Technical Sales</SelectItem>
                              <SelectItem value="Strategic Partnerships">Strategic Partnerships</SelectItem>
                              <SelectItem value="Technology Solutions">Technology Solutions</SelectItem>
                              <SelectItem value="Business Development">Business Development</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddMemberOpen(false)}
                        data-testid="button-cancel-member"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMemberMutation.isPending}
                        data-testid="button-save-member"
                      >
                        Add Member
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {membersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member: TeamMember) => {
                const stats = teamActivityStats[member.name] || {
                  totalActivities: 0,
                  companiesUpdated: 0,
                  analysesGenerated: 0,
                  lastActive: member.joinedAt,
                };

                return (
                  <Card key={member.id} className="p-6" data-testid={`team-member-${member.id}`}>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-card-foreground" data-testid={`member-name-${member.id}`}>
                          {member.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                        
                        <Badge className={getRoleColor(member.role)}>
                          {member.department}
                        </Badge>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="w-3 h-3 mr-2" />
                            {member.email}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-2" />
                            Joined {formatDistanceToNow(new Date(member.joinedAt!))} ago
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Activity className="w-3 h-3 mr-2" />
                            Last active {formatDistanceToNow(new Date(stats.lastActive))} ago
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold" data-testid={`member-activities-${member.id}`}>
                                {stats.totalActivities}
                              </div>
                              <div className="text-xs text-muted-foreground">Activities</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold" data-testid={`member-updates-${member.id}`}>
                                {stats.companiesUpdated}
                              </div>
                              <div className="text-xs text-muted-foreground">Updates</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold" data-testid={`member-analyses-${member.id}`}>
                                {stats.analysesGenerated}
                              </div>
                              <div className="text-xs text-muted-foreground">AI Analyses</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Team Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Team Activity</h3>
          
          {activitiesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No team activity recorded yet.</p>
              ) : (
                activities.slice(0, 10).map((activity: any) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start space-x-4 p-4 border border-border rounded-lg"
                    data-testid={`team-activity-${activity.id}`}
                  >
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.action)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-muted">
                            {getInitials(activity.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{activity.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp!))} ago
                        </span>
                      </div>
                      
                      <p className="text-sm text-card-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
