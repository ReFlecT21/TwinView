import { useState } from "react";
import Header from "@/components/layout/header";
import FiltersSection from "@/components/dashboard/filters-section";
import CompanyCard from "@/components/dashboard/company-card";
import CompanyModal from "@/components/company/company-modal";
import CompanyForm from "@/components/company/company-form";
import { Company } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function Companies() {
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

  const { data: companies = [], isLoading } = trpc.companies.getAll.useQuery(queryInput);

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleAddCompany = () => {
    setIsCompanyFormOpen(true);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Export companies report clicked");
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Companies"
        description="Manage and view all partner companies and their digital twin initiatives"
        onAddCompany={handleAddCompany}
        onExportReport={handleExportReport}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
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

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${companies.length} companies found`}
          </p>
        </div>

        {/* Company Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="companies-grid">
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
