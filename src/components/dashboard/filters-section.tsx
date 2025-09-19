import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, List, Grid3X3 } from "lucide-react";
import { industries } from "@shared/schema";

interface FiltersSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedIndustry: string;
  onIndustryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedOpportunityScore: string;
  onOpportunityScoreChange: (value: string) => void;
}

export default function FiltersSection({
  searchQuery,
  onSearchChange,
  selectedIndustry,
  onIndustryChange,
  selectedStatus,
  onStatusChange,
  selectedOpportunityScore,
  onOpportunityScoreChange,
}: FiltersSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
              data-testid="input-search"
            />
          </div>

          <Select value={selectedIndustry} onValueChange={onIndustryChange}>
            <SelectTrigger className="w-full sm:w-auto" data-testid="select-industry">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Industries">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-auto" data-testid="select-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="researching">Researching</SelectItem>
              <SelectItem value="implementing">Implementing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedOpportunityScore} onValueChange={onOpportunityScoreChange}>
            <SelectTrigger className="w-full sm:w-auto" data-testid="select-opportunity">
              <SelectValue placeholder="All Opportunity Scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Opportunity Scores">All Opportunity Scores</SelectItem>
              <SelectItem value="High (8-10)">High (8-10)</SelectItem>
              <SelectItem value="Medium (5-7)">Medium (5-7)</SelectItem>
              <SelectItem value="Low (1-4)">Low (1-4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" data-testid="button-more-filters">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
          <Button variant="outline" size="sm" data-testid="button-list-view">
            <List className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" data-testid="button-grid-view">
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
