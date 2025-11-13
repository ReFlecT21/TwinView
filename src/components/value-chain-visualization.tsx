import React from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Cpu,
  HardDrive,
  Brain,
  Monitor,
  ChevronRight,
  Building2,
  Package
} from 'lucide-react';
import { ValueChainStage } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ValueChainStageData {
  stage: ValueChainStage;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  dellProducts: string[];
  partnerCount?: number;
  isvCount?: number;
}

const stageData: ValueChainStageData[] = [
  {
    stage: ValueChainStage.DATA_CAPTURE_INGESTION,
    title: 'Data Capture & Ingestion',
    description: 'Collect and ingest data from IoT devices and sensors',
    icon: <Database className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    dellProducts: ['NativeEdge Gateways', 'IoT Connect']
  },
  {
    stage: ValueChainStage.EDGE_PROCESSING,
    title: 'Edge Processing',
    description: 'Process and analyze data at the edge for real-time insights',
    icon: <Cpu className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    dellProducts: ['PowerEdge XE', 'Edge Servers']
  },
  {
    stage: ValueChainStage.STORAGE_MANAGEMENT,
    title: 'Storage & Management',
    description: 'Store and manage large-scale Digital Twin data',
    icon: <HardDrive className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    dellProducts: ['PowerScale', 'PowerStore', 'PowerProtect']
  },
  {
    stage: ValueChainStage.COMPUTE_SIMULATION,
    title: 'Compute & Simulation',
    description: 'Run simulations and AI models on Digital Twin data',
    icon: <Brain className="w-8 h-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    dellProducts: ['PowerEdge GPU', 'AI Factory', 'Omniverse (NVIDIA)']
  },
  {
    stage: ValueChainStage.VISUALIZATION_DECISION,
    title: 'Visualization & Decision',
    description: 'Visualize insights and make data-driven decisions',
    icon: <Monitor className="w-8 h-8" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    dellProducts: ['Cloud Integration', 'Displays', 'Analytics Platform']
  }
];

interface ValueChainVisualizationProps {
  partners?: Array<{
    id: string;
    name: string;
    valueChainStages: ValueChainStage[];
    primaryValueChainStage?: ValueChainStage | null;
  }>;
  isvs?: Array<{
    id: string;
    name: string;
    valueChainStages: ValueChainStage[];
    primaryValueChainStage?: ValueChainStage | null;
  }>;
  showDetails?: boolean;
  onStageClick?: (stage: ValueChainStage) => void;
  selectedStage?: ValueChainStage | null;
}

export function ValueChainVisualization({
  partners = [],
  isvs = [],
  showDetails = true,
  onStageClick,
  selectedStage
}: ValueChainVisualizationProps) {
  // Calculate counts for each stage
  const stageCounts = stageData.map(stage => ({
    ...stage,
    partnerCount: partners.filter(p => p.valueChainStages?.includes(stage.stage)).length,
    isvCount: isvs.filter(i => i.valueChainStages?.includes(stage.stage)).length
  }));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Digital Twin Value Chain
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Dell&apos;s comprehensive infrastructure for Digital Twin solutions
        </p>
      </div>

      {/* Value Chain Pipeline */}
      <div className="relative">
        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />

        {/* Stage Cards */}
        <div className="relative grid grid-cols-5 gap-4 z-10">
          {stageCounts.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Stage Card */}
              <Card
                className={`
                  p-4 cursor-pointer transition-all duration-200
                  ${selectedStage === stage.stage
                    ? 'ring-2 ring-blue-500 shadow-lg transform scale-105'
                    : 'hover:shadow-md hover:transform hover:scale-102'}
                `}
                onClick={() => onStageClick?.(stage.stage)}
              >
                {/* Stage Icon and Title */}
                <div className={`${stage.bgColor} rounded-lg p-3 mb-3`}>
                  <div className={`${stage.color} flex justify-center`}>
                    {stage.icon}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-gray-900 mb-1 text-center">
                  {stage.title}
                </h4>

                {showDetails && (
                  <>
                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3 text-center line-clamp-2">
                      {stage.description}
                    </p>

                    {/* Counts */}
                    <div className="flex justify-center gap-2 mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {stage.partnerCount}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stage.partnerCount} Partner Companies</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="text-xs">
                              <Package className="w-3 h-3 mr-1" />
                              {stage.isvCount}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stage.isvCount} ISV/Startups</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Dell Products */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-1">Dell Products:</p>
                      <div className="space-y-1">
                        {stage.dellProducts.map(product => (
                          <div key={product} className="text-xs text-gray-600 truncate">
                            • {product}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {/* Arrow between stages */}
              {index < stageCounts.length - 1 && (
                <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {showDetails && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Selected Stage</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Partner Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">ISV/Startups</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Click on a stage to filter partners
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard widget
export function ValueChainWidget({
  partners = [],
  isvs = []
}: {
  partners?: Array<{
    valueChainStages: ValueChainStage[];
  }>;
  isvs?: Array<{
    valueChainStages: ValueChainStage[];
  }>;
}) {
  const stageCounts = stageData.map(stage => ({
    ...stage,
    total:
      partners.filter(p => p.valueChainStages?.includes(stage.stage)).length +
      isvs.filter(i => i.valueChainStages?.includes(stage.stage)).length
  }));

  return (
    <div className="space-y-3">
      {stageCounts.map((stage) => (
        <div key={stage.stage} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${stage.bgColor} ${stage.color} p-1.5 rounded`}>
              {React.cloneElement(stage.icon as React.ReactElement, { className: 'w-4 h-4' })}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {stage.title.split('&')[0].trim()}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {stage.total} partners
          </Badge>
        </div>
      ))}
    </div>
  );
}