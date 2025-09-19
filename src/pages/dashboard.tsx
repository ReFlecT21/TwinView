import { useState } from "react";
import Header from "@/components/layout/header";
import KPICards from "@/components/dashboard/kpi-cards";
import FiltersSection from "@/components/dashboard/filters-section";
import CompanyCard from "@/components/dashboard/company-card";
import ActivityFeed from "@/components/dashboard/activity-feed";
import CompanyModal from "@/components/company/company-modal";
import CompanyForm from "@/components/company/company-form";
import { Company } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedOpportunityScore, setSelectedOpportunityScore] = useState("All Opportunity Scores");

  // Build query parameters for tRPC
  const queryInput = {
    search: searchQuery || undefined,
    industry: selectedIndustry !== "All Industries" ? selectedIndustry : undefined,
    digitalTwinStatus: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
  };

  const { data: companies = [], isLoading: companiesLoading } = trpc.companies.getAll.useQuery(queryInput);

  // Note: Analytics endpoint needs to be created in tRPC
  const { data: analytics, isLoading: analyticsLoading } = trpc.companies.getAll.useQuery({}, {
    select: (data) => {
      // Calculate analytics from companies data
      const total = data.length;
      const byStatus = data.reduce((acc, company) => {
        acc[company.digitalTwinStatus] = (acc[company.digitalTwinStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalRevenue = data.reduce((sum, c) => sum + (parseFloat(c.estimatedDealValue || '0') || 0), 0);
      const highOpportunityCount = data.filter(c => c.opportunityScore >= 80).length;

      return {
        totalPartners: total,
        activeProjects: byStatus.active || 0,
        highOpportunityCount: highOpportunityCount,
        pipelineValue: `$${(totalRevenue / 1000000).toFixed(1)}M`,
      };
    }
  });

  const { data: activities = [], isLoading: activitiesLoading } = trpc.activityLogs.getAll.useQuery();

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleAddCompany = () => {
    setIsCompanyFormOpen(true);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Export report clicked");
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Digital Twin Partner Intelligence"
        description="Track and analyze partner digital twin strategies and Dell opportunities"
        onAddCompany={handleAddCompany}
        onExportReport={handleExportReport}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI Cards */}
        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : analytics ? (
          <KPICards analytics={analytics} />
        ) : null}

        {/* Filters */}
        <FiltersSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIndustry={selectedIndustry}
          onIndustryChange={setSelectedIndustry}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedOpportunityScore={selectedOpportunityScore}
          onOpportunityScoreChange={setSelectedOpportunityScore}
        />

        {/* Company Cards */}
        {companiesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="company-grid">
            {companies.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No companies found matching your criteria.</p>
                <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or add a new company.</p>
              </div>
            ) : (
              companies.map((company: Company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onClick={() => handleCompanyClick(company)}
                />
              ))
            )}
          </div>
        )}

        {/* Activity Feed */}
        {activitiesLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <ActivityFeed activities={activities} />
        )}
      </div>

      {/* Modals */}
      <CompanyModal
        company={selectedCompany}
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setSelectedCompany(null);
        }}
      />

      <CompanyForm
        isOpen={isCompanyFormOpen}
        onClose={() => setIsCompanyFormOpen(false)}
      />
    </div>
  );
}
