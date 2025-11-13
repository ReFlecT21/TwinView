import { ValueChainStage, Company, ISVStartup, DellProduct } from '@prisma/client';

interface ValueChainScoreFactors {
  stageCoverage: number;      // How many stages the partner covers (0-100)
  primaryFocus: number;        // Has a primary focus stage (0-100)
  stageMaturity: number;       // Maturity in each stage (0-100)
  dellAlignment: number;       // Alignment with Dell products (0-100)
  ecosystemFit: number;        // Fit within the ecosystem (0-100)
  integrationCapability: number; // Integration capabilities (0-100)
}

interface ValueChainScore {
  totalScore: number;
  factors: ValueChainScoreFactors;
  recommendations: string[];
  gaps: ValueChainStage[];
  strengths: ValueChainStage[];
}

// Weight factors for overall score calculation
const SCORE_WEIGHTS = {
  stageCoverage: 0.25,
  primaryFocus: 0.10,
  stageMaturity: 0.20,
  dellAlignment: 0.20,
  ecosystemFit: 0.15,
  integrationCapability: 0.10,
};

// Calculate value chain score for a company
export function calculateCompanyValueChainScore(
  company: Company & {
    companyDellProducts?: Array<{
      dellProduct: DellProduct;
      adoptionStatus: string;
    }>;
  },
  allCompanies: Company[],
  dellProducts: DellProduct[]
): ValueChainScore {
  const factors: ValueChainScoreFactors = {
    stageCoverage: 0,
    primaryFocus: 0,
    stageMaturity: 0,
    dellAlignment: 0,
    ecosystemFit: 0,
    integrationCapability: 0,
  };

  const recommendations: string[] = [];
  const gaps: ValueChainStage[] = [];
  const strengths: ValueChainStage[] = [];

  // 1. Stage Coverage Score (how many stages covered)
  const allStages = Object.values(ValueChainStage);
  const coveredStages = company.valueChainStages || [];
  factors.stageCoverage = (coveredStages.length / allStages.length) * 100;

  // Identify gaps
  allStages.forEach(stage => {
    if (!coveredStages.includes(stage)) {
      gaps.push(stage);
    } else {
      strengths.push(stage);
    }
  });

  // 2. Primary Focus Score
  factors.primaryFocus = company.primaryValueChainStage ? 100 : 0;
  if (!company.primaryValueChainStage && coveredStages.length > 0) {
    recommendations.push('Define a primary value chain focus area to strengthen positioning');
  }

  // 3. Stage Maturity Score (based on valueChainMaturity JSON field)
  if (company.valueChainMaturity && typeof company.valueChainMaturity === 'object') {
    const maturityData = company.valueChainMaturity as Record<string, number>;
    const maturityScores = coveredStages.map(stage => maturityData[stage] || 0);
    factors.stageMaturity = maturityScores.length > 0
      ? maturityScores.reduce((a, b) => a + b, 0) / maturityScores.length
      : 0;
  } else {
    // Fallback: use digitalTwinMaturity as proxy
    factors.stageMaturity = company.digitalTwinMaturity || 0;
  }

  // 4. Dell Alignment Score (based on Dell products used)
  if (company.companyDellProducts && company.companyDellProducts.length > 0) {
    const adoptedProducts = company.companyDellProducts.filter(
      p => p.adoptionStatus === 'deployed' || p.adoptionStatus === 'production'
    );
    const alignmentScore = (adoptedProducts.length / dellProducts.length) * 100;
    factors.dellAlignment = Math.min(alignmentScore, 100);
  } else {
    factors.dellAlignment = 0;
    recommendations.push('Explore Dell product integrations to strengthen partnership');
  }

  // 5. Ecosystem Fit Score (based on complementary partners in stages)
  const ecosystemScore = calculateEcosystemFit(company, allCompanies, coveredStages);
  factors.ecosystemFit = ecosystemScore;

  // 6. Integration Capability Score (based on technology stack)
  factors.integrationCapability = calculateIntegrationCapability(company);

  // Calculate total score
  const totalScore = Object.entries(SCORE_WEIGHTS).reduce((total, [factor, weight]) => {
    return total + (factors[factor as keyof ValueChainScoreFactors] * weight);
  }, 0);

  // Generate recommendations based on gaps and scores
  if (gaps.length > 0) {
    const gapStages = gaps.map(g => getStageLabel(g)).join(', ');
    recommendations.push(`Expand coverage to: ${gapStages}`);
  }

  if (factors.stageMaturity < 50) {
    recommendations.push('Increase Digital Twin maturity through pilot projects');
  }

  if (factors.ecosystemFit < 50) {
    recommendations.push('Build partnerships with complementary value chain partners');
  }

  return {
    totalScore: Math.round(totalScore),
    factors,
    recommendations,
    gaps,
    strengths,
  };
}

// Calculate value chain score for an ISV/Startup
export function calculateISVValueChainScore(
  isv: ISVStartup & {
    isvDellProducts?: Array<{
      dellProduct: DellProduct;
      integrationType: string;
    }>;
  },
  allISVs: ISVStartup[],
  dellProducts: DellProduct[]
): ValueChainScore {
  const factors: ValueChainScoreFactors = {
    stageCoverage: 0,
    primaryFocus: 0,
    stageMaturity: 0,
    dellAlignment: 0,
    ecosystemFit: 0,
    integrationCapability: 0,
  };

  const recommendations: string[] = [];
  const gaps: ValueChainStage[] = [];
  const strengths: ValueChainStage[] = [];

  // 1. Stage Coverage Score
  const allStages = Object.values(ValueChainStage);
  const coveredStages = isv.valueChainStages || [];
  factors.stageCoverage = (coveredStages.length / allStages.length) * 100;

  // Identify gaps and strengths
  allStages.forEach(stage => {
    if (!coveredStages.includes(stage)) {
      gaps.push(stage);
    } else {
      strengths.push(stage);
    }
  });

  // 2. Primary Focus Score
  factors.primaryFocus = isv.primaryValueChainStage ? 100 : 0;

  // 3. Stage Maturity Score (based on maturity stage and capabilities)
  const maturityMultiplier = {
    'Early': 0.25,
    'Growth': 0.50,
    'Mature': 0.75,
    'Leader': 1.0,
  };
  const baseMaturity = maturityMultiplier[isv.maturityStage || 'Early'] * 100;

  // Adjust based on capabilities
  if (isv.valueChainCapabilities && typeof isv.valueChainCapabilities === 'object') {
    const capabilities = isv.valueChainCapabilities as Record<string, any>;
    const capabilityScore = Object.keys(capabilities).length * 10; // Each capability adds 10 points
    factors.stageMaturity = Math.min((baseMaturity + capabilityScore) / 2, 100);
  } else {
    factors.stageMaturity = baseMaturity;
  }

  // 4. Dell Alignment Score
  if (isv.isvDellProducts && isv.isvDellProducts.length > 0) {
    const certifiedProducts = isv.isvDellProducts.filter(
      p => p.integrationType === 'certified' || p.integrationType === 'optimized'
    );
    const alignmentScore = (certifiedProducts.length / dellProducts.length) * 100;
    factors.dellAlignment = Math.min(alignmentScore * 2, 100); // ISVs typically integrate with fewer products
  } else {
    factors.dellAlignment = isv.dellValidated ? 50 : 0;
  }

  // 5. Ecosystem Fit Score
  factors.ecosystemFit = calculateISVEcosystemFit(isv, allISVs);

  // 6. Integration Capability Score
  factors.integrationCapability = calculateISVIntegrationCapability(isv);

  // Calculate total score
  const totalScore = Object.entries(SCORE_WEIGHTS).reduce((total, [factor, weight]) => {
    return total + (factors[factor as keyof ValueChainScoreFactors] * weight);
  }, 0);

  // Generate recommendations
  if (!isv.dellValidated) {
    recommendations.push('Pursue Dell validation to strengthen partnership');
  }

  if (!isv.hasOpenAPIs) {
    recommendations.push('Develop open APIs to improve integration capabilities');
  }

  if (gaps.length > 2) {
    recommendations.push('Focus on core value chain stages rather than broad coverage');
  }

  if (factors.integrationCapability < 60) {
    recommendations.push('Enhance integration capabilities and certifications');
  }

  return {
    totalScore: Math.round(totalScore),
    factors,
    recommendations,
    gaps,
    strengths,
  };
}

// Helper function to calculate ecosystem fit for companies
function calculateEcosystemFit(
  company: Company,
  allCompanies: Company[],
  coveredStages: ValueChainStage[]
): number {
  if (coveredStages.length === 0) return 0;

  // Check how many other companies are in complementary stages
  const complementaryPartners = allCompanies.filter(other => {
    if (other.id === company.id) return false;
    const otherStages = other.valueChainStages || [];
    // Check if they have adjacent or complementary stages
    return otherStages.some(stage => !coveredStages.includes(stage));
  });

  const fitScore = Math.min((complementaryPartners.length / allCompanies.length) * 200, 100);
  return fitScore;
}

// Helper function to calculate ecosystem fit for ISVs
function calculateISVEcosystemFit(isv: ISVStartup, allISVs: ISVStartup[]): number {
  // Check synergy scores if available
  if (isv.synergyScores && typeof isv.synergyScores === 'object') {
    const scores = Object.values(isv.synergyScores as Record<string, number>);
    if (scores.length > 0) {
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }

  // Fallback: check matched partners
  const matchedCount = isv.matchedPartners?.length || 0;
  const maxMatches = Math.min(allISVs.length, 10); // Cap at 10 for reasonable scoring
  return Math.min((matchedCount / maxMatches) * 100, 100);
}

// Helper function to calculate integration capability for companies
function calculateIntegrationCapability(company: Company): number {
  let score = 50; // Base score

  // Check technology stack
  if (company.technologyStack && typeof company.technologyStack === 'object') {
    const techStack = company.technologyStack as Record<string, any>;
    score += Object.keys(techStack).length * 5; // Each technology adds 5 points
  }

  // Bonus for completed Digital Twin status
  if (company.digitalTwinStatus === 'completed') {
    score += 20;
  } else if (company.digitalTwinStatus === 'implementing') {
    score += 10;
  }

  // Cap at 100
  return Math.min(score, 100);
}

// Helper function to calculate integration capability for ISVs
function calculateISVIntegrationCapability(isv: ISVStartup): number {
  let score = 0;

  // Open APIs
  if (isv.hasOpenAPIs) score += 30;

  // Integrations
  const integrationCount = isv.integrations?.length || 0;
  score += Math.min(integrationCount * 10, 30); // Up to 30 points for integrations

  // Certifications
  const certificationCount = isv.certifications?.length || 0;
  score += Math.min(certificationCount * 10, 20); // Up to 20 points for certifications

  // Dell Validation
  if (isv.dellValidated) score += 20;

  return Math.min(score, 100);
}

// Helper function to get readable stage label
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

// Calculate ecosystem synergy between two partners
export function calculatePartnerSynergy(
  partner1: { valueChainStages: ValueChainStage[]; primaryValueChainStage?: ValueChainStage | null },
  partner2: { valueChainStages: ValueChainStage[]; primaryValueChainStage?: ValueChainStage | null }
): number {
  const stages1 = partner1.valueChainStages || [];
  const stages2 = partner2.valueChainStages || [];

  // No synergy if either has no stages
  if (stages1.length === 0 || stages2.length === 0) return 0;

  // Calculate overlap (lower is better for complementary fit)
  const overlap = stages1.filter(s => stages2.includes(s)).length;
  const totalUnique = new Set([...stages1, ...stages2]).size;

  // Perfect complementary fit: no overlap but covers adjacent stages
  const complementaryScore = ((totalUnique - overlap) / totalUnique) * 50;

  // Check for adjacent stages (value chain continuity)
  const stageOrder = Object.values(ValueChainStage);
  let adjacencyBonus = 0;

  stages1.forEach(s1 => {
    const index1 = stageOrder.indexOf(s1);
    stages2.forEach(s2 => {
      const index2 = stageOrder.indexOf(s2);
      if (Math.abs(index1 - index2) === 1) {
        adjacencyBonus += 25; // Adjacent stages
      }
    });
  });

  // Primary focus alignment
  let focusBonus = 0;
  if (partner1.primaryValueChainStage && partner2.primaryValueChainStage) {
    const index1 = stageOrder.indexOf(partner1.primaryValueChainStage);
    const index2 = stageOrder.indexOf(partner2.primaryValueChainStage);
    if (Math.abs(index1 - index2) === 1) {
      focusBonus = 25; // Adjacent primary focus
    }
  }

  return Math.min(complementaryScore + adjacencyBonus + focusBonus, 100);
}

// Identify partnership opportunities in the value chain
export interface PartnershipOpportunity {
  stage: ValueChainStage;
  currentPartners: number;
  gap: boolean;
  recommendedActions: string[];
  potentialValue: 'High' | 'Medium' | 'Low';
}

export function identifyPartnershipOpportunities(
  companies: Company[],
  isvs: ISVStartup[],
  targetCoverage: number = 5 // Minimum partners per stage
): PartnershipOpportunity[] {
  const opportunities: PartnershipOpportunity[] = [];
  const allStages = Object.values(ValueChainStage);

  allStages.forEach(stage => {
    const companiesInStage = companies.filter(c => c.valueChainStages?.includes(stage)).length;
    const isvsInStage = isvs.filter(i => i.valueChainStages?.includes(stage)).length;
    const totalPartners = companiesInStage + isvsInStage;

    const gap = totalPartners < targetCoverage;
    const recommendedActions: string[] = [];
    let potentialValue: 'High' | 'Medium' | 'Low' = 'Medium';

    if (gap) {
      if (totalPartners === 0) {
        potentialValue = 'High';
        recommendedActions.push('Critical gap: No partners in this stage');
        recommendedActions.push('Actively recruit partners with capabilities in this area');
        recommendedActions.push('Consider developing internal capabilities');
      } else if (totalPartners < 3) {
        potentialValue = 'High';
        recommendedActions.push(`Only ${totalPartners} partners - high risk of dependency`);
        recommendedActions.push('Identify and onboard 2-3 additional partners');
      } else {
        potentialValue = 'Medium';
        recommendedActions.push(`${targetCoverage - totalPartners} more partners needed for optimal coverage`);
      }
    } else if (totalPartners > targetCoverage * 2) {
      potentialValue = 'Low';
      recommendedActions.push('Well-covered stage - focus on partner quality over quantity');
      recommendedActions.push('Identify top performers for strategic partnerships');
    }

    opportunities.push({
      stage,
      currentPartners: totalPartners,
      gap,
      recommendedActions,
      potentialValue,
    });
  });

  return opportunities.sort((a, b) => {
    // Sort by potential value (High > Medium > Low) then by current partners (ascending)
    const valueOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const valueDiff = valueOrder[b.potentialValue] - valueOrder[a.potentialValue];
    if (valueDiff !== 0) return valueDiff;
    return a.currentPartners - b.currentPartners;
  });
}