import Link from "next/link";
import { useRouter } from "next/router";
import { useUser, SignOutButton } from '@clerk/nextjs'
import {
  Home,
  Building2,
  BarChart3,
  FileText,
  Users,
  LogOut,
  Globe,
  Newspaper
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "ISV/Startups", href: "/isv-startups", icon: Globe },
  { name: "News", href: "/news", icon: Newspaper, hasBadge: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
];

export default function Sidebar() {
  const router = useRouter();
  const location = router.pathname;
  const { user } = useUser();

  // Fetch unread news count
  const { data: unreadData } = trpc.news.getUnreadCount.useQuery({}, {
    refetchInterval: 60000, // Refetch every minute
  });
  const unreadCount = unreadData?.count || 0;

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">D</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">Dell Partner Intel</h1>
            <p className="text-xs text-muted-foreground">Digital Twin Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.hasBadge && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className="mt-auto pt-6 border-t border-border">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
                <AvatarFallback>
                  {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {user.fullName || user.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            <SignOutButton>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-accent-foreground">
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        )}
      </div>
    </aside>
  );
}
