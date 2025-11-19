import { useState } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { isvVerticals, isvSizes, isvMaturityStages, isvInterestLevels, isvRegions } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface AddISVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddISVDialog({ open, onOpenChange }: AddISVDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: "",
    vertical: "" as any,
    headquarters: "",
    presence: [] as string[],
    regions: [] as Array<typeof isvRegions[number]>,
    coordinates: { lat: 0, lng: 0 },
    size: "" as any,
    maturityStage: "" as any,
    employees: 0,
    revenue: "",
    hasOpenAPIs: false,
    dellValidated: false,
    interestLevel: "" as any,
    integrations: [] as string[],
    notes: "",
  });

  const createISV = trpc.isvStartups.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "ISV/Startup Added",
        description: `${data.name} has been added successfully.`,
      });
      utils.isvStartups.getAll.invalidate();
      utils.isvStartups.getByVertical.invalidate();
      onOpenChange(false);
      router.push(`/isv/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.vertical) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in name and vertical",
        variant: "destructive",
      });
      return;
    }

    createISV.mutate({
      ...formData,
      employees: formData.employees || undefined,
      coordinates: (formData.coordinates.lat && formData.coordinates.lng) ? formData.coordinates : undefined,
    });
  };

  const handlePresenceChange = (value: string) => {
    const countries = value.split(",").map(c => c.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, presence: countries }));
  };

  const handleIntegrationsChange = (value: string) => {
    const integrations = value.split(",").map(i => i.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, integrations }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>Add New ISV/Startup</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Biofourmis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vertical">Vertical *</Label>
              <Select
                value={formData.vertical}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, vertical: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vertical" />
                </SelectTrigger>
                <SelectContent>
                  {isvVerticals.map((vertical) => (
                    <SelectItem key={vertical} value={vertical}>
                      {vertical.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters</Label>
              <Input
                id="headquarters"
                value={formData.headquarters}
                onChange={(e) => setFormData(prev => ({ ...prev, headquarters: e.target.value }))}
                placeholder="e.g., Singapore"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regions">Regions</Label>
              <Select
                value={formData.regions[0] || ""}
                onValueChange={(value: typeof isvRegions[number]) => setFormData(prev => ({
                  ...prev,
                  regions: value ? [value] : []
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {isvRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="presence">Presence (Countries)</Label>
            <Input
              id="presence"
              onChange={(e) => handlePresenceChange(e.target.value)}
              placeholder="e.g., Singapore, USA, India (comma-separated)"
            />
          </div>

          {/* Company Size & Stage */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select
                value={formData.size}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {isvSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maturityStage">Maturity Stage</Label>
              <Select
                value={formData.maturityStage}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, maturityStage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {isvMaturityStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees">Employees</Label>
              <Input
                id="employees"
                type="number"
                value={formData.employees || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, employees: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue">Revenue</Label>
            <Input
              id="revenue"
              value={formData.revenue}
              onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
              placeholder="e.g., $300M"
            />
          </div>

          {/* Interest Level */}
          <div className="space-y-2">
            <Label htmlFor="interestLevel">Interest Level</Label>
            <Select
              value={formData.interestLevel}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, interestLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interest level" />
              </SelectTrigger>
              <SelectContent>
                {isvInterestLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Openness & Compatibility */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasOpenAPIs"
                checked={formData.hasOpenAPIs}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOpenAPIs: checked }))}
              />
              <Label htmlFor="hasOpenAPIs">Has Open APIs</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="dellValidated"
                checked={formData.dellValidated}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dellValidated: checked }))}
              />
              <Label htmlFor="dellValidated">Dell Validated</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="integrations">Integrations/Partnerships</Label>
            <Input
              id="integrations"
              onChange={(e) => handleIntegrationsChange(e.target.value)}
              placeholder="e.g., NVIDIA, Azure, AWS (comma-separated)"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional information about the ISV/Startup..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createISV.isPending}
          >
            {createISV.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add ISV/Startup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}