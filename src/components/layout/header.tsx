import { Button } from "@/components/ui/button";
import { Plus, FileDown, User } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  onAddCompany?: () => void;
  onExportReport?: () => void;
}

export default function Header({ title, description, onAddCompany, onExportReport }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border p-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center space-x-4">
        {onAddCompany && (
          <Button 
            onClick={onAddCompany}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-add-company"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        )}
        {onExportReport && (
          <Button 
            variant="secondary"
            onClick={onExportReport}
            data-testid="button-export-report"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        )}
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
