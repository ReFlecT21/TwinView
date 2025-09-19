import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertCompanySchema, industries, digitalTwinStatuses } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusLabels = {
  not_started: "Not Started",
  researching: "Researching",
  implementing: "Implementing",
  completed: "Completed"
};

export default function CompanyForm({ isOpen, onClose }: CompanyFormProps) {
  const [businessAreasInput, setBusinessAreasInput] = useState("");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: "",
      industry: "",
      country: "",
      employees: undefined,
      revenue: "",
      headquarters: "",
      ceo: "",
      founded: undefined,
      website: "",
      businessAreas: [],
      digitalTwinStatus: "not_started",
      digitalTwinMaturity: 0,
      opportunityScore: 50,
      estimatedDealValue: "",
      notes: "",
    },
  });

  const createCompanyMutation = trpc.companies.create.useMutation({
    onSuccess: () => {
      utils.companies.getAll.invalidate();
      toast({
        title: "Company Created",
        description: "Company has been successfully added to the database.",
      });
      form.reset();
      setBusinessAreasInput("");
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const businessAreas = businessAreasInput
      .split(',')
      .map(area => area.trim())
      .filter(area => area.length > 0);

    const companyData = {
      ...data,
      businessAreas,
      employees: data.employees ? parseInt(data.employees) : undefined,
      founded: data.founded ? parseInt(data.founded) : undefined,
    };

    createCompanyMutation.mutate(companyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="company-form-modal">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Siemens AG" {...field} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Germany" {...field} data-testid="input-company-country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 385000" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-company-employees"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., €62.3B" {...field} data-testid="input-company-revenue" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="headquarters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headquarters</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Munich, Germany" {...field} data-testid="input-company-headquarters" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ceo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEO</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Roland Busch" {...field} data-testid="input-company-ceo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="founded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founded Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1847" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-company-founded"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., siemens.com" {...field} data-testid="input-company-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Business Areas</FormLabel>
                <Input
                  placeholder="e.g., Digital Industries, Smart Infrastructure (comma-separated)"
                  value={businessAreasInput}
                  onChange={(e) => setBusinessAreasInput(e.target.value)}
                  data-testid="input-company-business-areas"
                />
              </div>
            </div>

            {/* Digital Twin Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Digital Twin Information</h3>
              
              <FormField
                control={form.control}
                name="digitalTwinStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digital Twin Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-digital-twin-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {digitalTwinStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="digitalTwinMaturity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digital Twin Maturity (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="e.g., 75" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-digital-twin-maturity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="opportunityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opportunity Score (1-100)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          placeholder="e.g., 82" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                          data-testid="input-opportunity-score"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimatedDealValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Deal Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $850K" {...field} data-testid="input-estimated-deal-value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes about this company..."
                        rows={4}
                        {...field}
                        data-testid="textarea-company-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-company">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCompanyMutation.isPending}
                data-testid="button-save-company"
              >
                {createCompanyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Company"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
