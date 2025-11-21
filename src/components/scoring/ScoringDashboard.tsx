import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreEditor } from "./ScoreEditor";
import {
  SCORING_WEIGHTS,
  REVENUE_SUBWEIGHTS,
  getScoreColor,
  getScoreLabel,
  formatScore,
  getScoreEmoji,
} from "@/lib/scoring";
import { Company } from "@shared/schema";

interface ScoringDashboardProps {
  company: Company;
  onUpdate?: () => void;
}

export function ScoringDashboard({ company, onUpdate }: ScoringDashboardProps) {
  // Parse scores if they come as string, otherwise use the object
  const rawScores = typeof company.scores === 'string'
    ? JSON.parse(company.scores)
    : company.scores;

  const scores = {
    dataReliability: rawScores?.dataReliability || 3,
    dataReliabilityEvidence: rawScores?.dataReliabilityEvidence || [],
    existingRelations: rawScores?.existingRelations || 3,
    existingRelationsEvidence: rawScores?.existingRelationsEvidence || [],
    industry: rawScores?.industry || 3,
    industryEvidence: rawScores?.industryEvidence || [],
    revenuePotential: rawScores?.revenuePotential || 3,
    revenuePotentialEvidence: rawScores?.revenuePotentialEvidence || [],
    projects: rawScores?.projects || 3,
    projectsEvidence: rawScores?.projectsEvidence || [],
    partnerMarketAccess: rawScores?.partnerMarketAccess || 3,
    partnerMarketAccessEvidence: rawScores?.partnerMarketAccessEvidence || [],
    solutionMaturity: rawScores?.solutionMaturity || 3,
    solutionMaturityEvidence: rawScores?.solutionMaturityEvidence || [],
    partnerScale: rawScores?.partnerScale || 3,
    partnerScaleEvidence: rawScores?.partnerScaleEvidence || [],
    growthMomentum: rawScores?.growthMomentum || 3,
    growthMomentumEvidence: rawScores?.growthMomentumEvidence || [],
    investmentReadiness: rawScores?.investmentReadiness || 3,
    investmentReadinessEvidence: rawScores?.investmentReadinessEvidence || [],
    totalScore: rawScores?.totalScore || 3,
    lastUpdated: rawScores?.lastUpdated || new Date().toISOString(),
    updatedBy: rawScores?.updatedBy || "",
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Overall Score</h3>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{getScoreEmoji(scores.totalScore)}</span>
              <span className={`text-4xl font-bold ${getScoreColor(scores.totalScore)}`}>
                {formatScore(scores.totalScore)}
              </span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {getScoreLabel(scores.totalScore)}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
            <div className="font-medium">
              {scores.lastUpdated ? new Date(scores.lastUpdated).toLocaleDateString() : "Never"}
            </div>
            {scores.updatedBy && (
              <div className="text-sm text-muted-foreground">by {scores.updatedBy}</div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Scoring Breakdown */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Scoring Breakdown</h3>

        <div className="space-y-6">
          {/* Revenue Potential (50%) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">Revenue Potential</span>
                  <Badge variant="outline">50% Weight</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={(scores.revenuePotential / 5) * 100}
                    className="flex-1 h-3"
                  />
                  <span className={`font-bold ${getScoreColor(scores.revenuePotential)}`}>
                    {formatScore(scores.revenuePotential)}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Sub-components */}
            <div className="ml-6 space-y-2">
              <ScoreEditor
                companyId={company.id}
                companyName={company.name}
                scoreType="projects"
                scoreLabel="Projects"
                currentScore={scores.projects}
                currentEvidence={scores.projectsEvidence || []}
                weight="35%"
                onUpdate={onUpdate}
              />
              <ScoreEditor
                companyId={company.id}
                companyName={company.name}
                scoreType="partnerMarketAccess"
                scoreLabel="Partner Market Access"
                currentScore={scores.partnerMarketAccess}
                currentEvidence={scores.partnerMarketAccessEvidence || []}
                weight="20%"
                onUpdate={onUpdate}
              />
              <ScoreEditor
                companyId={company.id}
                companyName={company.name}
                scoreType="solutionMaturity"
                scoreLabel="Solution Maturity/Sales Readiness"
                currentScore={scores.solutionMaturity}
                currentEvidence={scores.solutionMaturityEvidence || []}
                weight="20%"
                onUpdate={onUpdate}
              />
              <ScoreEditor
                companyId={company.id}
                companyName={company.name}
                scoreType="partnerScale"
                scoreLabel="Partner Scale"
                currentScore={scores.partnerScale}
                currentEvidence={scores.partnerScaleEvidence || []}
                weight="10%"
                onUpdate={onUpdate}
              />
              <ScoreEditor
                companyId={company.id}
                companyName={company.name}
                scoreType="growthMomentum"
                scoreLabel="Growth Momentum"
                currentScore={scores.growthMomentum}
                currentEvidence={scores.growthMomentumEvidence || []}
                weight="10%"
                onUpdate={onUpdate}
              />
              <ScoreEditor
                companyId={company.id}
                companyName={company.name}
                scoreType="investmentReadiness"
                scoreLabel="Investment Readiness"
                currentScore={scores.investmentReadiness}
                currentEvidence={scores.investmentReadinessEvidence || []}
                weight="5%"
                onUpdate={onUpdate}
              />
            </div>
          </div>

          {/* Industry Fit (25%) */}
          <ScoreEditor
            companyId={company.id}
            companyName={company.name}
            scoreType="industry"
            scoreLabel="Industry Fit"
            currentScore={scores.industry}
            currentEvidence={scores.industryEvidence || []}
            weight="25%"
            onUpdate={onUpdate}
          />

          {/* Existing Relations (15%) */}
          <ScoreEditor
            companyId={company.id}
            companyName={company.name}
            scoreType="existingRelations"
            scoreLabel="Existing Relations"
            currentScore={scores.existingRelations}
            currentEvidence={scores.existingRelationsEvidence || []}
            weight="15%"
            onUpdate={onUpdate}
          />

          {/* Data Reliability (10%) */}
          <ScoreEditor
            companyId={company.id}
            companyName={company.name}
            scoreType="dataReliability"
            scoreLabel="Data Reliability"
            currentScore={scores.dataReliability}
            currentEvidence={scores.dataReliabilityEvidence || []}
            weight="10%"
            onUpdate={onUpdate}
          />
        </div>
      </Card>

      {/* Score History */}
      {company.scoreHistory && company.scoreHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Score History</h3>
          <div className="space-y-2">
            {company.scoreHistory.slice(-5).reverse().map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <Badge variant="outline">{formatScore(entry.totalScore)}</Badge>
                  <span className="text-sm">{entry.changes}</span>
                </div>
                <span className="text-sm text-muted-foreground">by {entry.changedBy}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}