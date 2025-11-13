import { Company, ISVStartup, ValueChainStage, DellProduct } from '@prisma/client';
import {
  calculateCompanyValueChainScore,
  calculateISVValueChainScore,
  calculatePartnerSynergy,
  identifyPartnershipOpportunities,
} from './value-chain-scoring';

export interface PartnerRecommendation {
  partner: {
    id: string;
    name: string;
    type: 'company' | 'isv';
  };
  score: number;
  reason: string;
  benefits: string[];
  synergyScore: number;
  valueChainAlignment: string[];
  dellProductAlignment: string[];
  actionItems: string[];
}

export interface EcosystemRecommendation {
  title: string;
  description: string;
  partners: PartnerRecommendation[];
  totalValue: number;
  coverageImprovement: number;
  implementation: {
    phase: string;
    duration: string;
    steps: string[];
  };
}

// Generate partnership recommendations for a company
export function generateCompanyPartnershipRecommendations(
  company: Company & {
    companyDellProducts?: Array<{
      dellProduct: DellProduct;
      adoptionStatus: string;
    }>;
  },
  allCompanies: Company[],
  allISVs: ISVStartup[],
  dellProducts: DellProduct[]
): PartnerRecommendation[] {
  const recommendations: PartnerRecommendation[] = [];
  const companyStages = company.valueChainStages || [];

  // Find complementary companies
  allCompanies
    .filter(c => c.id !== company.id)
    .forEach(candidate => {
      const candidateStages = candidate.valueChainStages || [];
      if (candidateStages.length === 0) return;

      const synergyScore = calculatePartnerSynergy(company, candidate);
      if (synergyScore < 40) return; // Skip low synergy partnerships

      // Check for value chain complementarity
      const complementaryStages = candidateStages.filter(s => !companyStages.includes(s));
      const adjacentStages = getAdjacentStages(companyStages, candidateStages);

      if (complementaryStages.length > 0 || adjacentStages.length > 0) {
        const benefits: string[] = [];
        const actionItems: string[] = [];

        if (complementaryStages.length > 0) {
          benefits.push(`Fills gaps in: ${complementaryStages.map(s => getStageLabel(s)).join(', ')}`);
        }

        if (adjacentStages.length > 0) {
          benefits.push('Creates seamless value chain continuity');
        }

        if (candidate.digitalTwinStatus === 'completed') {
          benefits.push('Mature Digital Twin implementation');
        }

        // Generate action items
        actionItems.push('Schedule partnership exploration meeting');
        actionItems.push('Define integration points and data exchange protocols');
        if (complementaryStages.includes(ValueChainStage.DATA_CAPTURE_INGESTION)) {
          actionItems.push('Establish data ingestion pipeline integration');
        }
        if (complementaryStages.includes(ValueChainStage.VISUALIZATION_DECISION)) {
          actionItems.push('Create joint dashboard and reporting capabilities');
        }

        recommendations.push({
          partner: {
            id: candidate.id,
            name: candidate.name,
            type: 'company',
          },
          score: Math.round((synergyScore + candidate.opportunityScore) / 2),
          reason: `Complementary value chain coverage with ${complementaryStages.length} unique stages`,
          benefits,
          synergyScore,
          valueChainAlignment: complementaryStages.map(s => getStageLabel(s)),
          dellProductAlignment: [], // TODO: Calculate based on Dell product usage
          actionItems,
        });
      }
    });

  // Find complementary ISVs
  allISVs.forEach(isv => {
    const isvStages = isv.valueChainStages || [];
    if (isvStages.length === 0) return;

    const synergyScore = calculatePartnerSynergy(company, isv);
    if (synergyScore < 40) return;

    const complementaryStages = isvStages.filter(s => !companyStages.includes(s));
    const overlappingStages = isvStages.filter(s => companyStages.includes(s));

    if (complementaryStages.length > 0 || (overlappingStages.length > 0 && isv.hasOpenAPIs)) {
      const benefits: string[] = [];
      const actionItems: string[] = [];

      if (complementaryStages.length > 0) {
        benefits.push(`Extends capabilities to: ${complementaryStages.map(s => getStageLabel(s)).join(', ')}`);
      }

      if (isv.hasOpenAPIs) {
        benefits.push('Open APIs for easy integration');
      }

      if (isv.dellValidated) {
        benefits.push('Dell validated solution');
      }

      if (isv.certifications && isv.certifications.length > 0) {
        benefits.push(`Industry certifications: ${isv.certifications.slice(0, 2).join(', ')}`);
      }

      // Generate action items based on ISV capabilities
      actionItems.push('Technical integration assessment');
      if (isv.hasOpenAPIs) {
        actionItems.push('API integration planning session');
      }
      actionItems.push('Pilot project definition');
      if (isv.vertical === 'manufacturing' && company.industry === 'Manufacturing') {
        actionItems.push('Industry-specific use case development');
      }

      recommendations.push({
        partner: {
          id: isv.id,
          name: isv.name,
          type: 'isv',
        },
        score: Math.round(synergyScore),
        reason: isv.hasOpenAPIs
          ? 'Technology partner with open integration capabilities'
          : `Specialized solution for ${isv.vertical}`,
        benefits,
        synergyScore,
        valueChainAlignment: complementaryStages.map(s => getStageLabel(s)),
        dellProductAlignment: [], // TODO: Calculate based on Dell product support
        actionItems,
      });
    }
  });

  // Sort by score
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
}

// Generate ecosystem recommendations
export function generateEcosystemRecommendations(
  companies: Company[],
  isvs: ISVStartup[],
  dellProducts: DellProduct[],
  targetCompany?: Company
): EcosystemRecommendation[] {
  const recommendations: EcosystemRecommendation[] = [];
  const opportunities = identifyPartnershipOpportunities(companies, isvs);

  // Recommendation 1: Fill critical gaps
  const criticalGaps = opportunities.filter(o => o.gap && o.potentialValue === 'High');
  if (criticalGaps.length > 0) {
    const gapPartners: PartnerRecommendation[] = [];

    criticalGaps.forEach(gap => {
      // Find potential partners who could fill this gap
      const potentialCompanies = companies.filter(c =>
        !c.valueChainStages?.includes(gap.stage) &&
        c.digitalTwinStatus !== 'not_started'
      );

      const potentialISVs = isvs.filter(i =>
        !i.valueChainStages?.includes(gap.stage) &&
        i.maturityStage !== 'Early'
      );

      // Select top candidates
      potentialCompanies.slice(0, 2).forEach(c => {
        gapPartners.push({
          partner: {
            id: c.id,
            name: c.name,
            type: 'company',
          },
          score: c.opportunityScore,
          reason: `Potential to expand into ${getStageLabel(gap.stage)}`,
          benefits: [
            `Fills critical gap in ${getStageLabel(gap.stage)}`,
            'Reduces single point of failure risk',
          ],
          synergyScore: 70,
          valueChainAlignment: [getStageLabel(gap.stage)],
          dellProductAlignment: getDellProductsForStage(gap.stage, dellProducts),
          actionItems: [
            `Assess capability to enter ${getStageLabel(gap.stage)}`,
            'Provide Dell infrastructure support for expansion',
            'Create joint go-to-market strategy',
          ],
        });
      });
    });

    if (gapPartners.length > 0) {
      recommendations.push({
        title: 'Fill Critical Value Chain Gaps',
        description: `Address ${criticalGaps.length} critical gaps in the Digital Twin value chain`,
        partners: gapPartners,
        totalValue: 90,
        coverageImprovement: 40,
        implementation: {
          phase: 'Immediate',
          duration: '3-6 months',
          steps: [
            'Partner identification and outreach',
            'Capability assessment',
            'Pilot project initiation',
            'Integration and scaling',
          ],
        },
      });
    }
  }

  // Recommendation 2: Build integrated ecosystem
  const wellCoveredStages = opportunities.filter(o => !o.gap && o.currentPartners >= 5);
  if (wellCoveredStages.length >= 3) {
    const ecosystemPartners: PartnerRecommendation[] = [];

    // Find partners that span multiple stages
    const multiStageCompanies = companies.filter(c =>
      c.valueChainStages && c.valueChainStages.length >= 3
    );

    const multiStageISVs = isvs.filter(i =>
      i.valueChainStages && i.valueChainStages.length >= 2
    );

    // Select strategic partners
    multiStageCompanies.slice(0, 3).forEach(c => {
      ecosystemPartners.push({
        partner: {
          id: c.id,
          name: c.name,
          type: 'company',
        },
        score: c.opportunityScore,
        reason: 'Multi-stage value chain coverage',
        benefits: [
          'Reduces integration complexity',
          'Single point of contact for multiple stages',
          'Streamlined data flow',
        ],
        synergyScore: 80,
        valueChainAlignment: c.valueChainStages?.map(s => getStageLabel(s)) || [],
        dellProductAlignment: [],
        actionItems: [
          'Establish strategic partnership framework',
          'Create integrated solution architecture',
          'Develop joint customer success program',
        ],
      });
    });

    recommendations.push({
      title: 'Create Integrated Partner Ecosystem',
      description: 'Build a cohesive ecosystem with strategic multi-stage partners',
      partners: ecosystemPartners,
      totalValue: 85,
      coverageImprovement: 25,
      implementation: {
        phase: 'Strategic',
        duration: '6-12 months',
        steps: [
          'Strategic partner selection',
          'Integration architecture design',
          'Joint solution development',
          'Go-to-market alignment',
        ],
      },
    });
  }

  // Recommendation 3: Industry-specific solutions
  if (targetCompany) {
    const industryPartners: PartnerRecommendation[] = [];

    // Find ISVs in the same vertical
    const industryISVs = isvs.filter(i => {
      const industryMatch =
        (targetCompany.industry === 'Manufacturing' && i.vertical === 'manufacturing') ||
        (targetCompany.industry === 'Healthcare' && i.vertical === 'healthcare') ||
        (targetCompany.industry === 'Smart Cities' && i.vertical === 'smart_cities');
      return industryMatch && i.dellValidated;
    });

    industryISVs.slice(0, 3).forEach(i => {
      industryPartners.push({
        partner: {
          id: i.id,
          name: i.name,
          type: 'isv',
        },
        score: 75,
        reason: `Specialized ${i.vertical} solution`,
        benefits: [
          'Industry-specific expertise',
          'Pre-built use cases',
          'Faster time to value',
          'Regulatory compliance',
        ],
        synergyScore: 85,
        valueChainAlignment: i.valueChainStages?.map(s => getStageLabel(s)) || [],
        dellProductAlignment: [],
        actionItems: [
          'Industry use case workshop',
          'Compliance requirements review',
          'Custom solution design',
        ],
      });
    });

    if (industryPartners.length > 0) {
      recommendations.push({
        title: `${targetCompany.industry} Industry Solution`,
        description: `Build industry-specific Digital Twin solution for ${targetCompany.industry}`,
        partners: industryPartners,
        totalValue: 80,
        coverageImprovement: 20,
        implementation: {
          phase: 'Industry Focus',
          duration: '4-8 months',
          steps: [
            'Industry requirements analysis',
            'Solution customization',
            'Compliance validation',
            'Industry-specific pilot',
          ],
        },
      });
    }
  }

  return recommendations;
}

// Helper function to get adjacent stages
function getAdjacentStages(stages1: ValueChainStage[], stages2: ValueChainStage[]): ValueChainStage[] {
  const stageOrder = Object.values(ValueChainStage);
  const adjacent: ValueChainStage[] = [];

  stages1.forEach(s1 => {
    const index1 = stageOrder.indexOf(s1);
    stages2.forEach(s2 => {
      const index2 = stageOrder.indexOf(s2);
      if (Math.abs(index1 - index2) === 1 && !adjacent.includes(s2)) {
        adjacent.push(s2);
      }
    });
  });

  return adjacent;
}

// Helper function to get Dell products for a stage
function getDellProductsForStage(stage: ValueChainStage, products: DellProduct[]): string[] {
  return products
    .filter(p => p.valueChainStage === stage)
    .map(p => p.name)
    .slice(0, 3);
}

// Helper function to get stage label
function getStageLabel(stage: ValueChainStage): string {
  const labels: Record<ValueChainStage, string> = {
    [ValueChainStage.DATA_CAPTURE_INGESTION]: 'Data Capture',
    [ValueChainStage.EDGE_PROCESSING]: 'Edge Processing',
    [ValueChainStage.STORAGE_MANAGEMENT]: 'Storage',
    [ValueChainStage.COMPUTE_SIMULATION]: 'Compute',
    [ValueChainStage.VISUALIZATION_DECISION]: 'Visualization',
  };
  return labels[stage] || stage;
}

// Build complete value chain solution
export interface ValueChainSolution {
  name: string;
  description: string;
  stages: Array<{
    stage: ValueChainStage;
    partners: Array<{ id: string; name: string; role: string }>;
    dellProducts: string[];
    integrationPoints: string[];
  }>;
  benefits: string[];
  risks: string[];
  estimatedValue: string;
  implementationTime: string;
}

export function buildValueChainSolution(
  targetCompany: Company,
  partners: Array<Company | ISVStartup>,
  dellProducts: DellProduct[]
): ValueChainSolution {
  const solution: ValueChainSolution = {
    name: `Digital Twin Solution for ${targetCompany.name}`,
    description: `Comprehensive Digital Twin value chain implementation leveraging Dell infrastructure and partner ecosystem`,
    stages: [],
    benefits: [],
    risks: [],
    estimatedValue: '$5-10M',
    implementationTime: '12-18 months',
  };

  // Build stages
  const allStages = Object.values(ValueChainStage);
  allStages.forEach(stage => {
    const stagePartners = partners.filter(p => p.valueChainStages?.includes(stage));
    const stageProducts = dellProducts.filter(p => p.valueChainStage === stage);

    solution.stages.push({
      stage,
      partners: stagePartners.map(p => ({
        id: p.id,
        name: p.name,
        role: determinePartnerRole(p, stage),
      })),
      dellProducts: stageProducts.map(p => p.name),
      integrationPoints: generateIntegrationPoints(stage),
    });
  });

  // Generate benefits
  solution.benefits = [
    'End-to-end Digital Twin capability',
    'Integrated partner ecosystem',
    'Dell infrastructure optimization',
    'Reduced implementation risk',
    'Accelerated time to value',
  ];

  // Identify risks
  const gaps = solution.stages.filter(s => s.partners.length === 0);
  if (gaps.length > 0) {
    solution.risks.push(`Partnership gaps in ${gaps.length} stages`);
  }

  const singlePartnerStages = solution.stages.filter(s => s.partners.length === 1);
  if (singlePartnerStages.length > 0) {
    solution.risks.push('Single points of failure in value chain');
  }

  return solution;
}

// Determine partner role in a stage
function determinePartnerRole(partner: Company | ISVStartup, stage: ValueChainStage): string {
  const isISV = 'vertical' in partner;

  if (isISV) {
    const isv = partner as ISVStartup;
    if (isv.primaryValueChainStage === stage) {
      return 'Primary Technology Provider';
    }
    if (isv.hasOpenAPIs) {
      return 'Integration Partner';
    }
    return 'Solution Provider';
  } else {
    const company = partner as Company;
    if (company.primaryValueChainStage === stage) {
      return 'Lead Implementation Partner';
    }
    if (company.digitalTwinStatus === 'completed') {
      return 'Strategic Partner';
    }
    return 'Implementation Partner';
  }
}

// Generate integration points for a stage
function generateIntegrationPoints(stage: ValueChainStage): string[] {
  const integrationPoints: Record<ValueChainStage, string[]> = {
    [ValueChainStage.DATA_CAPTURE_INGESTION]: [
      'IoT device connectivity',
      'Data ingestion APIs',
      'Protocol translation',
      'Edge gateway management',
    ],
    [ValueChainStage.EDGE_PROCESSING]: [
      'Edge analytics engine',
      'Real-time processing',
      'Data filtering and aggregation',
      'Edge-to-cloud sync',
    ],
    [ValueChainStage.STORAGE_MANAGEMENT]: [
      'Data lake integration',
      'Time-series database',
      'Object storage',
      'Data lifecycle management',
    ],
    [ValueChainStage.COMPUTE_SIMULATION]: [
      'Simulation engine APIs',
      'AI/ML model deployment',
      'GPU cluster management',
      'Model training pipeline',
    ],
    [ValueChainStage.VISUALIZATION_DECISION]: [
      'Dashboard integration',
      'Reporting APIs',
      'Alert management',
      'Decision support systems',
    ],
  };

  return integrationPoints[stage] || [];
}