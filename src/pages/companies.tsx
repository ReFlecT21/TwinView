import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/layout/header";
import FiltersSection from "@/components/dashboard/filters-section";
import CompanyCard from "@/components/dashboard/company-card";
import CompanyForm from "@/components/company/company-form";
import { Company } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  getScoreColor,
  getScoreLabel,
  formatScore,
  getScoreEmoji,
  getScoreBgColor,
} from "@/lib/scoring";
import {
  Grid3x3,
  List,
  ArrowUpDown,
  GitCompare,
  FileText,
  Search,
} from "lucide-react";

export default function Companies() {
  const router = useRouter();
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedOpportunityScore, setSelectedOpportunityScore] = useState("All Opportunity Scores");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Build query parameters for tRPC
  const queryInput = {
    search: searchQuery || undefined,
    industry: selectedIndustry !== "All Industries" ? selectedIndustry : undefined,
    type: selectedType !== "All Types" ? (selectedType as any) : undefined,
    digitalTwinStatus: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
  };

  const { data: companies = [], isLoading } = trpc.companies.getAll.useQuery(queryInput);

  // Sort companies by total score
  const sortedCompanies = [...companies].sort((a, b) => {
    const scoreA = (a as any).scores?.totalScore || 3;
    const scoreB = (b as any).scores?.totalScore || 3;
    return scoreB - scoreA;
  });

  const handleCompanyClick = (company: any) => {
    router.push(`/company/${company.id}`);
  };

  const handleAddCompany = () => {
    setIsCompanyFormOpen(true);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Export companies report clicked");
  };

  const handleCompareSelected = () => {
    if (selectedCompanies.length >= 2) {
      // Navigate to comparison page with selected companies
      const queryParams = selectedCompanies.map(id => `id=${id}`).join('&');
      router.push(`/compare?${queryParams}`);
    }
  };

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId].slice(0, 4) // Max 4 companies
    );
  };

  const renderScoreDots = (score: number, max: number = 5) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < Math.floor(score) ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Partner Companies"
        description="Evaluate and compare potential Digital Twin partners"
        onAddCompany={handleAddCompany}
        onExportReport={handleExportReport}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Enhanced Filters with View Toggle */}
        <div className="space-y-4">
          <FiltersSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedIndustry={selectedIndustry}
            onIndustryChange={setSelectedIndustry}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedOpportunityScore={selectedOpportunityScore}
            onOpportunityScoreChange={setSelectedOpportunityScore}
          />

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${companies.length} companies found`}
              </p>
              {selectedCompanies.length > 0 && (
                <Badge variant="secondary">
                  {selectedCompanies.length} selected
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedCompanies.length >= 2 && (
                <Button
                  variant="default"
                  onClick={handleCompareSelected}
                  className="mr-2"
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare Selected ({selectedCompanies.length})
                </Button>
              )}
              <div className="flex rounded-lg bg-muted p-1">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === "table" && !isLoading && (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedCompanies.length === sortedCompanies.length && sortedCompanies.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCompanies(sortedCompanies.slice(0, 4).map(c => c.id));
                        } else {
                          setSelectedCompanies([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Overall Score
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Relations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <p className="text-muted-foreground text-lg">No companies found.</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Try adjusting your filters or add a new company.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCompanies.map((company, index) => {
                    const scores = (company as any).scores || {
                      totalScore: 3,
                      revenuePotential: 3,
                      dataReliability: 3,
                      industry: 3,
                      existingRelations: 3,
                    };

                    return (
                      <TableRow
                        key={company.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleCompanyClick(company)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedCompanies.includes(company.id)}
                            onChange={() => toggleCompanySelection(company.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold">
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {company.type} • {company.employees?.toLocaleString() || "N/A"} employees
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getScoreEmoji(scores.totalScore)}</span>
                            <div>
                              <div className={`font-bold ${getScoreColor(scores.totalScore)}`}>
                                {formatScore(scores.totalScore)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getScoreLabel(scores.totalScore)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {renderScoreDots(scores.revenuePotential)}
                            <div className="text-xs text-muted-foreground">
                              {formatScore(scores.revenuePotential)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {renderScoreDots(scores.dataReliability)}
                            <div className="text-xs text-muted-foreground">
                              {formatScore(scores.dataReliability)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {renderScoreDots(scores.industry)}
                            <div className="text-xs text-muted-foreground">
                              {formatScore(scores.industry)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {renderScoreDots(scores.existingRelations)}
                            <div className="text-xs text-muted-foreground">
                              {formatScore(scores.existingRelations)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              company.digitalTwinStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : company.digitalTwinStatus === "implementing"
                                ? "bg-blue-100 text-blue-800"
                                : company.digitalTwinStatus === "researching"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {company.digitalTwinStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompanyClick(company);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="companies-grid">
            {sortedCompanies.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No companies found.</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Try adjusting your filters or add a new company.
                </p>
              </div>
            ) : (
              sortedCompanies.map((company, index) => {
                const scores = (company as any).scores || {
                  totalScore: 3,
                  revenuePotential: 3,
                  dataReliability: 3,
                  industry: 3,
                  existingRelations: 3,
                };

                return (
                  <Card
                    key={company.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
                    onClick={() => handleCompanyClick(company)}
                  >
                    {/* Rank Badge */}
                    <Badge className="absolute top-4 right-4" variant="outline">
                      #{index + 1}
                    </Badge>

                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={() => toggleCompanySelection(company.id)}
                      />
                    </div>

                    {/* Company Info */}
                    <div className="mt-8 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {company.industry} • {company.country}
                        </p>
                      </div>

                      {/* Overall Score */}
                      <div className={`p-3 rounded-lg ${getScoreBgColor(scores.totalScore)}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Score</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getScoreEmoji(scores.totalScore)}</span>
                            <span className={`text-xl font-bold ${getScoreColor(scores.totalScore)}`}>
                              {formatScore(scores.totalScore)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Revenue:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {renderScoreDots(scores.revenuePotential)}
                            <span className="ml-1">{formatScore(scores.revenuePotential)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {renderScoreDots(scores.dataReliability)}
                            <span className="ml-1">{formatScore(scores.dataReliability)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Industry:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {renderScoreDots(scores.industry)}
                            <span className="ml-1">{formatScore(scores.industry)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Relations:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {renderScoreDots(scores.existingRelations)}
                            <span className="ml-1">{formatScore(scores.existingRelations)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        )}
      </div>

      {/* Company Form Modal */}
      <CompanyForm
        isOpen={isCompanyFormOpen}
        onClose={() => setIsCompanyFormOpen(false)}
      />
    </div>
  );
}