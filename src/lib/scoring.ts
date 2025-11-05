// Scoring Framework Utilities
export const SCORING_WEIGHTS = {
  revenuePotential: 0.50,
  industry: 0.25,
  existingRelations: 0.15,
  dataReliability: 0.10,
};

export const REVENUE_SUBWEIGHTS = {
  projects: 0.35,
  partnerMarketAccess: 0.20,
  solutionMaturity: 0.20,
  partnerScale: 0.10,
  growthMomentum: 0.10,
  investmentReadiness: 0.05,
};

export interface ScoreData {
  dataReliability: number;
  dataReliabilityEvidence: string[];
  existingRelations: number;
  existingRelationsEvidence: string[];
  industry: number;
  industryEvidence: string[];
  revenuePotential: number;
  revenuePotentialEvidence: string[];
  // Revenue Potential Sub-scores
  projects: number;
  projectsEvidence: string[];
  partnerMarketAccess: number;
  partnerMarketAccessEvidence: string[];
  solutionMaturity: number;
  solutionMaturityEvidence: string[];
  partnerScale: number;
  partnerScaleEvidence: string[];
  growthMomentum: number;
  growthMomentumEvidence: string[];
  investmentReadiness: number;
  investmentReadinessEvidence: string[];
  totalScore: number;
  lastUpdated: string;
  updatedBy: string;
}

export function calculateRevenuePotentialScore(scores: Partial<ScoreData>): number {
  const subScores = {
    projects: scores.projects || 3,
    partnerMarketAccess: scores.partnerMarketAccess || 3,
    solutionMaturity: scores.solutionMaturity || 3,
    partnerScale: scores.partnerScale || 3,
    growthMomentum: scores.growthMomentum || 3,
    investmentReadiness: scores.investmentReadiness || 3,
  };

  let weightedSum = 0;
  for (const [key, weight] of Object.entries(REVENUE_SUBWEIGHTS)) {
    weightedSum += subScores[key as keyof typeof subScores] * weight;
  }

  return Math.round(weightedSum * 100) / 100;
}

export function calculateTotalScore(scores: Partial<ScoreData>): number {
  // First calculate revenue potential from sub-scores
  const revenuePotentialScore = calculateRevenuePotentialScore(scores);

  const mainScores = {
    revenuePotential: revenuePotentialScore,
    industry: scores.industry || 3,
    existingRelations: scores.existingRelations || 3,
    dataReliability: scores.dataReliability || 3,
  };

  let weightedSum = 0;
  for (const [key, weight] of Object.entries(SCORING_WEIGHTS)) {
    weightedSum += mainScores[key as keyof typeof mainScores] * weight;
  }

  return Math.round(weightedSum * 100) / 100;
}

export function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600 dark:text-green-400";
  if (score >= 3.5) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 2.5) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 4.5) return "bg-green-100 dark:bg-green-900/20";
  if (score >= 3.5) return "bg-yellow-100 dark:bg-yellow-900/20";
  if (score >= 2.5) return "bg-orange-100 dark:bg-orange-900/20";
  return "bg-red-100 dark:bg-red-900/20";
}

export function getScoreEmoji(score: number): string {
  if (score >= 4.5) return "🟢";
  if (score >= 3.5) return "🟡";
  if (score >= 2.5) return "🟠";
  return "🔴";
}

export function getScoreLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 4) return "Strong";
  if (score >= 3.5) return "Good";
  if (score >= 3) return "Moderate";
  if (score >= 2.5) return "Fair";
  if (score >= 2) return "Weak";
  return "Poor";
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function getScoreProgressWidth(score: number, maxScore: number = 5): string {
  return `${(score / maxScore) * 100}%`;
}