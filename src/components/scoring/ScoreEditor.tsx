import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, X, Save, AlertCircle } from "lucide-react";
import { getScoreColor, getScoreLabel, formatScore } from "@/lib/scoring";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

interface ScoreEditorProps {
  companyId: string;
  companyName: string;
  scoreType: string;
  scoreLabel: string;
  currentScore: number;
  currentEvidence: string[];
  weight?: string;
  onUpdate?: () => void;
}

export function ScoreEditor({
  companyId,
  companyName,
  scoreType,
  scoreLabel,
  currentScore,
  currentEvidence,
  weight,
  onUpdate,
}: ScoreEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(currentScore);
  const [evidence, setEvidence] = useState(currentEvidence);
  const [newEvidenceItem, setNewEvidenceItem] = useState("");
  const { toast } = useToast();

  const updateScoreMutation = trpc.companies.updateScores.useMutation({
    onSuccess: () => {
      toast({
        title: "Score Updated",
        description: `${scoreLabel} score has been updated successfully.`,
      });
      setIsOpen(false);
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const scoreData: any = {
      [scoreType]: score,
      [`${scoreType}Evidence`]: evidence,
    };

    updateScoreMutation.mutate({
      id: companyId,
      scores: scoreData,
    });
  };

  const addEvidenceItem = () => {
    if (newEvidenceItem.trim()) {
      setEvidence([...evidence, newEvidenceItem.trim()]);
      setNewEvidenceItem("");
    }
  };

  const removeEvidenceItem = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleScoreChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      setScore(numValue);
    }
  };

  return (
    <>
      <div
        className="cursor-pointer hover:bg-secondary/50 p-4 rounded-lg transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{scoreLabel}</span>
              {weight && (
                <span className="text-xs text-muted-foreground">({weight})</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div
                    key={value}
                    className={`w-2 h-6 rounded-sm ${
                      value <= Math.floor(score)
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <span className={`font-semibold ${getScoreColor(score)}`}>
                {formatScore(score)}/5
              </span>
              <span className="text-sm text-muted-foreground">
                {getScoreLabel(score)}
              </span>
            </div>
            {evidence.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {evidence.length} evidence point{evidence.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Edit {scoreLabel} Score for {companyName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Score Selector */}
            <div className="space-y-3">
              <Label>Score (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={score === value ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setScore(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm">Current Score:</span>
                <span className={`font-semibold ${getScoreColor(score)}`}>
                  {formatScore(score)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({getScoreLabel(score)})
                </span>
              </div>
            </div>

            {/* Evidence Points */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Evidence Points</Label>
                <span className="text-xs text-muted-foreground">
                  Add bullet points to justify the score
                </span>
              </div>

              <div className="space-y-2">
                {evidence.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1 text-sm">{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidenceItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={newEvidenceItem}
                  onChange={(e) => setNewEvidenceItem(e.target.value)}
                  placeholder="Enter evidence point..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addEvidenceItem();
                    }
                  }}
                />
                <Button onClick={addEvidenceItem} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Guidelines */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-sm text-blue-900 dark:text-blue-100">
                  Scoring Guidelines
                </span>
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <div>• 5 = Excellent/Perfect fit</div>
                <div>• 4 = Strong/Above average</div>
                <div>• 3 = Moderate/Average</div>
                <div>• 2 = Weak/Below average</div>
                <div>• 1 = Poor/Minimal</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateScoreMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}