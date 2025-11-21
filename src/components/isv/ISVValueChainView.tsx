import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Cpu,
  HardDrive,
  Brain,
  Monitor,
  Package,
  CheckCircle,
  AlertCircle,
  Info,
  Layers,
  Zap,
} from 'lucide-react';
import { ValueChainStage } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ISVProduct {
  id?: string;
  name: string;
  description: string;
  features?: string[];
  stage: ValueChainStage;
  integrationType?: 'compatible' | 'certified' | 'optimized' | 'native';
}

interface ISVValueChainViewProps {
  isv: {
    id: string;
    name: string;
    valueChainStages: ValueChainStage[];
    primaryValueChainStage?: ValueChainStage | null;
    products?: any; // JSON field
    solutionsByStage?: any; // JSON field
    technologyOffering?: any; // JSON field
    valueChainCapabilities?: any; // JSON field
    dellProductsSupported?: any; // JSON field
    integrationPoints?: any; // JSON field
  };
  dellProducts?: Array<{
    id: string;
    name: string;
    category: string;
    valueChainStage: ValueChainStage;
    description?: string;
  }>;
  showPartnershipOpportunities?: boolean;
}

const stageData = [
  {
    stage: ValueChainStage.DATA_CAPTURE_INGESTION,
    title: 'Data Capture & Ingestion',
    shortTitle: 'Data Capture',
    description: 'Collect and ingest data from IoT devices and sensors',
    icon: Database,
    color: 'blue',
    dellProducts: ['NativeEdge Gateways', 'IoT Connect'],
  },
  {
    stage: ValueChainStage.EDGE_PROCESSING,
    title: 'Edge Processing',
    shortTitle: 'Edge',
    description: 'Process and analyze data at the edge for real-time insights',
    icon: Cpu,
    color: 'purple',
    dellProducts: ['PowerEdge XE', 'Edge Servers'],
  },
  {
    stage: ValueChainStage.STORAGE_MANAGEMENT,
    title: 'Storage & Management',
    shortTitle: 'Storage',
    description: 'Store and manage large-scale Digital Twin data',
    icon: HardDrive,
    color: 'green',
    dellProducts: ['PowerScale', 'PowerStore', 'PowerProtect'],
  },
  {
    stage: ValueChainStage.COMPUTE_SIMULATION,
    title: 'Compute & Simulation',
    shortTitle: 'Compute',
    description: 'Run simulations and AI models on Digital Twin data',
    icon: Brain,
    color: 'orange',
    dellProducts: ['PowerEdge GPU', 'AI Factory', 'Omniverse (NVIDIA)'],
  },
  {
    stage: ValueChainStage.VISUALIZATION_DECISION,
    title: 'Visualization & Decision',
    shortTitle: 'Visualization',
    description: 'Visualize insights and make data-driven decisions',
    icon: Monitor,
    color: 'indigo',
    dellProducts: ['Cloud Integration', 'Displays', 'Analytics Platform'],
  },
];

export function ISVValueChainView({
  isv,
  dellProducts = [],
  showPartnershipOpportunities = true,
}: ISVValueChainViewProps) {
  const [selectedStage, setSelectedStage] = useState<ValueChainStage | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Parse JSON fields
  const products: ISVProduct[] = isv.products || [];
  const solutionsByStage = isv.solutionsByStage || {};
  const capabilities = isv.valueChainCapabilities || {};
  const technologyOffering = isv.technologyOffering || {};
  const integrationPoints = isv.integrationPoints || [];

  // Calculate coverage percentage
  const coveragePercentage = Math.round((isv.valueChainStages.length / 5) * 100);

  // Get stage details
  const getStageDetails = (stage: ValueChainStage) => {
    const stageInfo = stageData.find(s => s.stage === stage);
    const isActive = isv.valueChainStages.includes(stage);
    const isPrimary = isv.primaryValueChainStage === stage;
    const stageSolutions = solutionsByStage[stage] || [];
    const stageCapabilities = capabilities[stage] || [];
    const stageTech = technologyOffering[stage] || [];

    if (!stageInfo) {
      return {
        stage,
        title: stage,
        shortTitle: stage,
        description: '',
        icon: Package,
        color: 'gray',
        dellProducts: [],
        isActive,
        isPrimary,
        solutions: stageSolutions,
        capabilities: stageCapabilities,
        technologies: stageTech,
        products: products.filter(p => p.stage === stage),
      };
    }

    return {
      ...stageInfo,
      isActive,
      isPrimary,
      solutions: stageSolutions,
      capabilities: stageCapabilities,
      technologies: stageTech,
      products: products.filter(p => p.stage === stage),
    };
  };

  // Get integration type badge color
  const getIntegrationBadgeColor = (type?: string) => {
    switch (type) {
      case 'native':
        return 'bg-green-100 text-green-800';
      case 'optimized':
        return 'bg-blue-100 text-blue-800';
      case 'certified':
        return 'bg-purple-100 text-purple-800';
      case 'compatible':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Identify gaps and opportunities
  const identifyGaps = () => {
    const gaps: Array<{
      stage: string;
      dellProducts: string[];
      opportunity: string;
    }> = [];
    const uncoveredStages = stageData.filter(
      stage => !isv.valueChainStages.includes(stage.stage)
    );

    uncoveredStages.forEach(stage => {
      gaps.push({
        stage: stage.title,
        dellProducts: stage.dellProducts,
        opportunity: `Partner with Dell for ${stage.shortTitle} capabilities`,
      });
    });

    return gaps;
  };

  const gaps = identifyGaps();

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Value Chain Coverage</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Coverage:</span>
                <Badge variant="outline" className="font-bold">
                  {coveragePercentage}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Stages:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {isv.valueChainStages.length} / 5
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={coveragePercentage} className="h-2 mb-4" />

          {/* Value Chain Visualization */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {stageData.map((stage, index) => {
              const details = getStageDetails(stage.stage);
              const Icon = stage.icon;

              return (
                <TooltipProvider key={stage.stage}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedStage(
                          selectedStage === stage.stage ? null : stage.stage
                        )}
                        className={`
                          relative p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${details.isActive
                            ? `bg-${stage.color}-50 border-${stage.color}-300`
                            : 'bg-gray-50 border-gray-200 opacity-50'}
                          ${selectedStage === stage.stage ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                          ${details.isPrimary ? 'border-solid' : 'border-dashed'}
                        `}
                      >
                        {details.isPrimary && (
                          <Badge className="absolute -top-2 -right-2 text-xs bg-blue-600">
                            Primary
                          </Badge>
                        )}

                        <div className="flex flex-col items-center text-center">
                          <Icon className={`w-8 h-8 mb-2 text-${stage.color}-600`} />
                          <p className="text-xs font-medium">{stage.shortTitle}</p>

                          {details.isActive && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {details.products.length} products
                              </Badge>
                            </div>
                          )}
                        </div>

                        {index < stageData.length - 1 && (
                          <div className={`absolute top-1/2 -right-2 transform -translate-y-1/2 z-10
                            ${details.isActive && getStageDetails(stageData[index + 1].stage).isActive
                              ? `text-${stage.color}-400`
                              : 'text-gray-300'}`}>
                            →
                          </div>
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-semibold">{stage.title}</p>
                        <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                        {details.isActive ? (
                          <div className="text-sm">
                            <p className="text-green-600">✓ ISV covers this stage</p>
                            <p>{details.products.length} products available</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Not covered by this ISV</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products & Solutions</TabsTrigger>
          <TabsTrigger value="integration">Dell Integration</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isv.valueChainStages.map(stage => {
              const details = getStageDetails(stage);
              const Icon = details?.icon || Package;

              return (
                <Card key={stage}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 text-${details?.color}-600`} />
                      <CardTitle className="text-base">
                        {details?.title}
                        {details?.isPrimary && (
                          <Badge className="ml-2 text-xs">Primary Focus</Badge>
                        )}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {details?.capabilities?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Capabilities:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {details.capabilities.map((cap: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {details?.technologies?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Technologies:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {details.technologies.map((tech: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product, index) => {
                const stage = getStageDetails(product.stage);
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{product.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {stage?.shortTitle}
                          </Badge>
                        </div>
                        {product.integrationType && (
                          <Badge className={getIntegrationBadgeColor(product.integrationType)}>
                            {product.integrationType}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.description}
                      </p>
                      {product.features && product.features.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Key Features:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {product.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No products have been added yet. Add products to show how this ISV
                supports different stages of the value chain.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dell Product Integration</CardTitle>
            </CardHeader>
            <CardContent>
              {integrationPoints.length > 0 ? (
                <div className="space-y-4">
                  {integrationPoints.map((point: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">{point.dellProduct}</p>
                        <p className="text-sm text-muted-foreground">
                          {point.description}
                        </p>
                      </div>
                      <Badge>{point.type || 'Integration'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No Dell product integrations documented yet. Add integration
                    points to show how this ISV works with Dell&apos;s technology stack.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Supported Dell Products */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Dell Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stageData.map(stage => {
                  const isActive = isv.valueChainStages.includes(stage.stage);
                  return (
                    <div
                      key={stage.stage}
                      className={`p-3 rounded-lg border ${
                        isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stage.icon className={`w-4 h-4 ${
                          isActive ? `text-${stage.color}-600` : 'text-gray-400'
                        }`} />
                        <p className="font-medium text-sm">{stage.shortTitle}</p>
                        {isActive && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {stage.dellProducts.map(product => (
                          <div key={product} className="text-xs text-muted-foreground">
                            • {product}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {showPartnershipOpportunities && gaps.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <p className="font-semibold mb-2">Partnership Opportunities Identified</p>
                <p className="text-sm mb-3">
                  This ISV covers {isv.valueChainStages.length} out of 5 value chain stages.
                  Partnering with Dell can provide complete end-to-end coverage.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {gaps.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {gaps.map((gap, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{gap.stage} Gap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{gap.opportunity}</p>
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Dell Products:</p>
                      <div className="flex flex-wrap gap-2">
                        {gap.dellProducts.map(product => (
                          <Badge key={product} variant="outline">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-semibold">Complete Coverage!</p>
                <p className="text-sm mt-1">
                  This ISV provides solutions across all value chain stages.
                  Focus on deepening integration with Dell products for enhanced capabilities.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Strategic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Bundling Strategy</p>
                    <p className="text-sm text-muted-foreground">
                      Create solution bundles combining ISV&apos;s {isv.primaryValueChainStage ?
                        stageData.find(s => s.stage === isv.primaryValueChainStage)?.shortTitle :
                        'offerings'} with Dell&apos;s complementary products.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Integration Priority</p>
                    <p className="text-sm text-muted-foreground">
                      {isv.valueChainStages.length < 3
                        ? 'Focus on deep integration in specialized stages'
                        : 'Leverage broad coverage for end-to-end solutions'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Customer Approach</p>
                    <p className="text-sm text-muted-foreground">
                      Position as {coveragePercentage >= 60
                        ? 'comprehensive Digital Twin partner with Dell enhancement'
                        : 'specialized solution with Dell for complete coverage'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}