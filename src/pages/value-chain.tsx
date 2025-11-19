import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/layout/header';
import { ValueChainVisualization } from '@/components/value-chain-visualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { ValueChainStage, ISVVertical } from '@prisma/client';
import {
  Building2,
  Package,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Layers,
  GitBranch
} from 'lucide-react';

const stageLabels: Record<ValueChainStage, string> = {
  [ValueChainStage.DATA_CAPTURE_INGESTION]: 'Data Capture & Ingestion',
  [ValueChainStage.EDGE_PROCESSING]: 'Edge Processing',
  [ValueChainStage.STORAGE_MANAGEMENT]: 'Storage & Management',
  [ValueChainStage.COMPUTE_SIMULATION]: 'Compute & Simulation',
  [ValueChainStage.VISUALIZATION_DECISION]: 'Visualization & Decision',
};

export default function ValueChainPage() {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<ValueChainStage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<ISVVertical | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'isvs' | 'products'>('overview');

  // Fetch data
  const { data: companies = [], isLoading: companiesLoading } = trpc.companies.getAll.useQuery({
    search: searchQuery || undefined,
  });

  const { data: isvs = [], isLoading: isvsLoading } = trpc.isvStartups.getAll.useQuery({
    search: searchQuery || undefined,
    vertical: selectedVertical !== 'all' ? selectedVertical : undefined,
  });

  const { data: valueChainStats, isLoading: statsLoading } = trpc.dellProducts.getValueChainStats.useQuery();
  const { data: productsByStage, isLoading: productsLoading } = trpc.dellProducts.getByValueChain.useQuery();

  // Filter partners by selected stage
  const filteredCompanies = selectedStage
    ? companies.filter(c => c.valueChainStages?.includes(selectedStage))
    : companies;

  const filteredISVs = selectedStage
    ? isvs.filter(i => i.valueChainStages?.includes(selectedStage))
    : isvs;

  const handleStageClick = (stage: ValueChainStage) => {
    setSelectedStage(stage === selectedStage ? null : stage);
  };

  const handlePartnerClick = (partnerId: string, type: 'company' | 'isv') => {
    router.push(type === 'company' ? `/company/${partnerId}` : `/isv/${partnerId}`);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Export value chain report');
  };

  const isLoading = companiesLoading || isvsLoading || statsLoading || productsLoading;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Digital Twin Value Chain Analysis"
        description="Analyze partner coverage and opportunities across the Digital Twin value chain"
        actionButton={
          <Button onClick={handleExportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Value Chain Visualization */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ValueChainVisualization
                partners={companies}
                isvs={isvs}
                showDetails={true}
                onStageClick={handleStageClick}
                selectedStage={selectedStage}
              />
            )}
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        {valueChainStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Coverage</p>
                    <p className="text-2xl font-bold">{valueChainStats.overall.coveragePercentage}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Partners Mapped</p>
                    <p className="text-2xl font-bold">{valueChainStats.overall.withValueChain}</p>
                  </div>
                  <Layers className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Partners</p>
                    <p className="text-2xl font-bold">{valueChainStats.overall.totalPartners}</p>
                  </div>
                  <GitBranch className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Gap Stages</p>
                    <p className="text-2xl font-bold">{valueChainStats.gaps.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedVertical} onValueChange={(value: any) => setSelectedVertical(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Verticals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verticals</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="smart_cities">Smart Cities</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>

              {selectedStage && (
                <Badge variant="secondary" className="h-10 px-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {stageLabels[selectedStage]}
                  <button
                    onClick={() => setSelectedStage(null)}
                    className="ml-2 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Different Views */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">
              Companies ({filteredCompanies.length})
            </TabsTrigger>
            <TabsTrigger value="isvs">
              ISVs ({filteredISVs.length})
            </TabsTrigger>
            <TabsTrigger value="products">
              Dell Products
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {(valueChainStats?.gaps?.length ?? 0) > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-800">Partnership Gaps Identified</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-700 mb-4">
                    The following stages have less than 5 partners and represent opportunities for growth:
                  </p>
                  <div className="space-y-2">
                    {valueChainStats?.gaps?.map(gap => (
                      <div key={gap} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium">{stageLabels[gap]}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStage(gap)}
                        >
                          View Partners
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stage-by-Stage Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {valueChainStats?.stageStats.map(stage => (
                <Card key={stage.stage}>
                  <CardHeader>
                    <CardTitle className="text-lg">{stageLabels[stage.stage]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Partners:</span>
                        <span className="font-medium">{stage.totalPartners}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Companies:</span>
                        <span className="font-medium">{stage.companies}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ISVs:</span>
                        <span className="font-medium">{stage.isvs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Primary Focus:</span>
                        <span className="font-medium">{stage.primaryFocus}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map(company => (
                <Card
                  key={company.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePartnerClick(company.id, 'company')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{company.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{company.industry}</p>
                      </div>
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {company.valueChainStages?.map(stage => (
                          <Badge key={stage} variant="secondary" className="text-xs">
                            {stageLabels[stage].split('&')[0].trim()}
                          </Badge>
                        ))}
                      </div>
                      {company.primaryValueChainStage && (
                        <p className="text-xs text-gray-600">
                          Primary: {stageLabels[company.primaryValueChainStage]}
                        </p>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-600">
                          Score: {company.opportunityScore}/100
                        </span>
                        <Badge variant={company.digitalTwinStatus === 'completed' ? 'default' : 'outline'}>
                          {company.digitalTwinStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ISVs Tab */}
          <TabsContent value="isvs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredISVs.map(isv => (
                <Card
                  key={isv.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePartnerClick(isv.id, 'isv')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{isv.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{isv.vertical}</p>
                      </div>
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {isv.valueChainStages?.map(stage => (
                          <Badge key={stage} variant="secondary" className="text-xs">
                            {stageLabels[stage].split('&')[0].trim()}
                          </Badge>
                        ))}
                      </div>
                      {isv.primaryValueChainStage && (
                        <p className="text-xs text-gray-600">
                          Primary: {stageLabels[isv.primaryValueChainStage]}
                        </p>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        {isv.dellValidated && (
                          <Badge variant="default" className="text-xs">Dell Validated</Badge>
                        )}
                        {isv.maturityStage && (
                          <Badge variant="outline" className="text-xs">{isv.maturityStage}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dell Products Tab */}
          <TabsContent value="products">
            <div className="space-y-6">
              {productsByStage?.map(stageGroup => (
                <div key={stageGroup.stage}>
                  <h3 className="text-lg font-semibold mb-3">{stageLabels[stageGroup.stage]}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stageGroup.products.map(product => (
                      <Card key={product.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              {product._count.companyProducts} companies
                            </span>
                            <span className="text-gray-500">
                              {product._count.isvProducts} ISVs
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}