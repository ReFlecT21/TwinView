import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Company } from "@shared/schema";
import { trpc } from "@/lib/trpc";
import {
  getScoreColor,
  getScoreLabel,
  formatScore,
  getScoreEmoji,
  SCORING_WEIGHTS,
} from "@/lib/scoring";
import { ArrowRight, Plus, X } from "lucide-react";

interface ComparisonViewProps {
  companies: Company[];
  initialCompanyId?: string;
}

export function ComparisonView({ companies, initialCompanyId }: ComparisonViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialCompanyId ? [initialCompanyId] : []
  );

  const { data: comparisonData } = trpc.companies.compareCompanies.useQuery(
    { companyIds: selectedIds },
    { enabled: selectedIds.length >= 2 }
  );

  const addCompany = (companyId: string) => {
    if (!selectedIds.includes(companyId) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, companyId]);
    }
  };

  const removeCompany = (companyId: string) => {
    setSelectedIds(selectedIds.filter(id => id !== companyId));
  };

  const getScoreDifference = (score1: number, score2: number) => {
    const diff = score1 - score2;
    if (diff > 0) return `+${diff.toFixed(2)}`;
    return diff.toFixed(2);
  };

  const renderScoreBar = (score: number, maxScore: number = 5) => {
    const percentage = (score / maxScore) * 100;
    return (
      <div className="flex items-center gap-2 flex-1">
        <Progress value={percentage} className="flex-1 h-3" />
        <span className={`font-semibold min-w-[50px] text-right ${getScoreColor(score)}`}>
          {formatScore(score)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Company Selector */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Select Companies to Compare</h3>

        <div className="flex flex-wrap gap-3 mb-4">
          {selectedIds.map(id => {
            const company = companies.find(c => c.id === id);
            return company ? (
              <div key={id} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                <span className="font-medium">{company.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCompany(id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : null;
          })}

          {selectedIds.length < 4 && (
            <Select onValueChange={addCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add company..." />
              </SelectTrigger>
              <SelectContent>
                {companies
                  .filter(c => !selectedIds.includes(c.id))
                  .map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedIds.length < 2 && (
          <p className="text-sm text-muted-foreground">
            Select at least 2 companies to start comparing (max 4)
          </p>
        )}
      </Card>

      {/* Comparison Table */}
      {comparisonData && comparisonData.length >= 2 && (
        <>
          <Card className="p-6 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-6">Score Comparison</h3>

            <div className="min-w-[600px]">
              {/* Header Row */}
              <div className="grid grid-cols-5 gap-4 mb-4 pb-4 border-b">
                <div className="font-medium">Metric</div>
                {comparisonData.slice(0, 4).map(company => (
                  <div key={company.id} className="font-medium text-center">
                    {company.name}
                  </div>
                ))}
              </div>

              {/* Overall Score */}
              <div className="grid grid-cols-5 gap-4 mb-6 p-4 bg-primary/5 rounded-lg">
                <div className="font-semibold flex items-center">
                  Overall Score
                </div>
                {comparisonData.slice(0, 4).map(company => {
                  const totalScore = company.scores?.totalScore || 3;
                  return (
                    <div key={company.id} className="text-center">
                      <div className="text-2xl mb-1">{getScoreEmoji(totalScore)}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                        {formatScore(totalScore)}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {getScoreLabel(totalScore)}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              {/* Individual Metrics */}
              <div className="space-y-3">
                {/* Revenue Potential */}
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span>Revenue Potential</span>
                    <Badge variant="outline" className="text-xs">50%</Badge>
                  </div>
                  {comparisonData.map(company => (
                    <div key={company.id}>
                      {renderScoreBar(company.scores?.revenuePotential || 3)}
                    </div>
                  ))}
                </div>

                {/* Industry Fit */}
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span>Industry Fit</span>
                    <Badge variant="outline" className="text-xs">25%</Badge>
                  </div>
                  {comparisonData.map(company => (
                    <div key={company.id}>
                      {renderScoreBar(company.scores?.industry || 3)}
                    </div>
                  ))}
                </div>

                {/* Existing Relations */}
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span>Existing Relations</span>
                    <Badge variant="outline" className="text-xs">15%</Badge>
                  </div>
                  {comparisonData.map(company => (
                    <div key={company.id}>
                      {renderScoreBar(company.scores?.existingRelations || 3)}
                    </div>
                  ))}
                </div>

                {/* Data Reliability */}
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span>Data Reliability</span>
                    <Badge variant="outline" className="text-xs">10%</Badge>
                  </div>
                  {comparisonData.map(company => (
                    <div key={company.id}>
                      {renderScoreBar(company.scores?.dataReliability || 3)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Key Differentiators */}
          {comparisonData.length === 2 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Key Differentiators</h3>

              <div className="space-y-3">
                {(() => {
                  const [company1, company2] = comparisonData;
                  const scores1 = company1.scores || {};
                  const scores2 = company2.scores || {};

                  const differentiators = [
                    {
                      metric: "Overall Score",
                      score1: scores1.totalScore || 3,
                      score2: scores2.totalScore || 3,
                    },
                    {
                      metric: "Revenue Potential",
                      score1: scores1.revenuePotential || 3,
                      score2: scores2.revenuePotential || 3,
                    },
                    {
                      metric: "Industry Fit",
                      score1: scores1.industry || 3,
                      score2: scores2.industry || 3,
                    },
                    {
                      metric: "Existing Relations",
                      score1: scores1.existingRelations || 3,
                      score2: scores2.existingRelations || 3,
                    },
                    {
                      metric: "Data Reliability",
                      score1: scores1.dataReliability || 3,
                      score2: scores2.dataReliability || 3,
                    },
                  ].filter(d => Math.abs(d.score1 - d.score2) > 0.1)
                    .sort((a, b) => Math.abs(b.score1 - b.score2) - Math.abs(a.score1 - a.score2));

                  return differentiators.length > 0 ? (
                    differentiators.map((diff, index) => {
                      const winner = diff.score1 > diff.score2 ? company1 : company2;
                      const advantage = Math.abs(diff.score1 - diff.score2);

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{diff.metric}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="default">{winner.name}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            +{advantage.toFixed(2)} advantage
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground">
                      Companies have similar scores across all metrics
                    </p>
                  );
                })()}
              </div>
            </Card>
          )}

          {/* Ranking */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Ranking</h3>

            <div className="space-y-3">
              {comparisonData
                .slice()
                .sort((a, b) => (b.scores?.totalScore || 3) - (a.scores?.totalScore || 3))
                .map((company, index) => {
                  const totalScore = company.scores?.totalScore || 3;
                  return (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {company.industry} • {company.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getScoreEmoji(totalScore)}</span>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                            {formatScore(totalScore)}
                          </div>
                          <Badge variant="secondary">{getScoreLabel(totalScore)}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}