import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  Building2,
  BarChart3,
  FileText,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
];

export default function Sidebar() {
  const router = useRouter();
  const location = router.pathname;

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
                  "flex items-center space-x-3 p-3 rounded-md font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
