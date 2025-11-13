import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Database,
  Cpu,
  HardDrive,
  Brain,
  Monitor,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Users,
  Package
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ValueChainStage } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const stageConfig = {
  [ValueChainStage.DATA_CAPTURE_INGESTION]: {
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Data Capture',
    fullLabel: 'Data Capture & Ingestion'
  },
  [ValueChainStage.EDGE_PROCESSING]: {
    icon: Cpu,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Edge',
    fullLabel: 'Edge Processing'
  },
  [ValueChainStage.STORAGE_MANAGEMENT]: {
    icon: HardDrive,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Storage',
    fullLabel: 'Storage & Management'
  },
  [ValueChainStage.COMPUTE_SIMULATION]: {
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Compute',
    fullLabel: 'Compute & Simulation'
  },
  [ValueChainStage.VISUALIZATION_DECISION]: {
    icon: Monitor,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    label: 'Visualization',
    fullLabel: 'Visualization & Decision'
  },
};

export function ValueChainDashboardWidget() {
  const { data: stats, isLoading } = trpc.dellProducts.getValueChainStats.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const maxPartners = Math.max(...stats.stageStats.map(s => s.totalPartners));
  const hasGaps = stats.gaps.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Digital Twin Value Chain
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Partner coverage across stages
          </p>
        </div>
        <Link href="/value-chain">
          <Button variant="ghost" size="sm" className="text-blue-600">
            View Details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Overall Coverage */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Coverage
          </span>
          <Badge variant={stats.overall.coveragePercentage >= 75 ? 'default' : 'secondary'}>
            {stats.overall.coveragePercentage}%
          </Badge>
        </div>
        <Progress value={stats.overall.coveragePercentage} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {stats.overall.withValueChain} of {stats.overall.totalPartners} partners mapped
          </span>
          {hasGaps && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gaps identified in {stats.gaps.length} stages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="space-y-3">
        {stats.stageStats.map((stage) => {
          const config = stageConfig[stage.stage];
          const Icon = config.icon;
          const percentage = maxPartners > 0 ? (stage.totalPartners / maxPartners) * 100 : 0;
          const isGap = stats.gaps.includes(stage.stage);

          return (
            <div
              key={stage.stage}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-all
                ${isGap ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`${config.bgColor} p-2 rounded`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {config.label}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {stage.companies} companies
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {stage.isvs} ISVs
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isGap && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="border-amber-400 text-amber-600">
                          Gap
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Less than 5 partners in this stage</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Badge variant="secondary" className="min-w-[50px] justify-center">
                  {stage.totalPartners}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>
              {stats.stageStats.reduce((sum, s) => sum + s.primaryFocus, 0)} primary focus partners
            </span>
          </div>
          {hasGaps && (
            <Button variant="outline" size="sm" className="text-amber-600">
              Address Gaps
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Compact version for smaller spaces
export function ValueChainMiniWidget() {
  const { data: stats, isLoading } = trpc.dellProducts.getValueChainStats.useQuery();

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">Value Chain</h4>
        <Badge variant="secondary">
          {stats.overall.coveragePercentage}%
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {stats.stageStats.map((stage) => {
          const config = stageConfig[stage.stage];
          const Icon = config.icon;
          const isGap = stats.gaps.includes(stage.stage);

          return (
            <TooltipProvider key={stage.stage}>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={`
                      flex-1 p-2 rounded text-center
                      ${isGap ? 'bg-amber-50' : config.bgColor}
                    `}
                  >
                    <Icon className={`h-4 w-4 mx-auto ${config.color}`} />
                    <p className="text-xs font-medium mt-1">{stage.totalPartners}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{config.fullLabel}</p>
                    <p>{stage.companies} companies, {stage.isvs} ISVs</p>
                    {isGap && <p className="text-amber-500">Gap identified</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      {stats.gaps.length > 0 && (
        <p className="text-xs text-amber-600 mt-2">
          {stats.gaps.length} stages need attention
        </p>
      )}
    </Card>
  );
}