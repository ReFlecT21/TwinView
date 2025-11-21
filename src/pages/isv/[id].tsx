import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import {
  isvVerticals,
  isvSizes,
  isvMaturityStages,
  isvInterestLevels,
  isvRegions
} from "@shared/schema";
import {
  MapPin,
  Globe,
  Users,
  Building2,
  TrendingUp,
  Link2,
  CheckCircle,
  Shield,
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  Loader2,
} from "lucide-react";

export default function ISVDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [newIntegration, setNewIntegration] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newMembership, setNewMembership] = useState("");
  const [newReason, setNewReason] = useState("");

  const { data: isv, isLoading, refetch } = trpc.isvStartups.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const utils = trpc.useUtils();

  // Update mutation
  const updateISV = trpc.isvStartups.update.useMutation({
    onSuccess: () => {
      toast({
        title: "ISV Updated",
        description: "The ISV has been updated successfully.",
      });
      setIsEditMode(false);
      refetch();
      utils.isvStartups.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteISV = trpc.isvStartups.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "ISV Deleted",
        description: "The ISV has been deleted successfully.",
      });
      router.push("/isv-startups");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize form data when ISV data is loaded
  useEffect(() => {
    if (isv) {
      setFormData({
        name: isv.name || "",
        vertical: isv.vertical || "",
        headquarters: isv.headquarters || "",
        presence: isv.presence || [],
        regions: isv.regions || [],
        size: isv.size || "",
        maturityStage: isv.maturityStage || "",
        employees: isv.employees || 0,
        revenue: isv.revenue || "",
        hasOpenAPIs: isv.hasOpenAPIs || false,
        dellValidated: isv.dellValidated || false,
        interestLevel: isv.interestLevel || "",
        integrations: isv.integrations || [],
        consortiumMemberships: isv.consortiumMemberships || [],
        certifications: isv.certifications || [],
        interestReasons: isv.interestReasons || [],
        notes: isv.notes || "",
        strategicValue: isv.strategicValue || "",
      });
    }
  }, [isv]);

  const handleSave = () => {
    updateISV.mutate({
      id: id as string,
      data: {
        ...formData,
        employees: formData.employees ? parseInt(formData.employees) : undefined,
      },
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form data to original ISV data
    if (isv) {
      setFormData({
        name: isv.name || "",
        vertical: isv.vertical || "",
        headquarters: isv.headquarters || "",
        presence: isv.presence || [],
        regions: isv.regions || [],
        size: isv.size || "",
        maturityStage: isv.maturityStage || "",
        employees: isv.employees || 0,
        revenue: isv.revenue || "",
        hasOpenAPIs: isv.hasOpenAPIs || false,
        dellValidated: isv.dellValidated || false,
        interestLevel: isv.interestLevel || "",
        integrations: isv.integrations || [],
        consortiumMemberships: isv.consortiumMemberships || [],
        certifications: isv.certifications || [],
        interestReasons: isv.interestReasons || [],
        notes: isv.notes || "",
        strategicValue: isv.strategicValue || "",
      });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this ISV?")) {
      deleteISV.mutate({ id: id as string });
    }
  };

  const addToArray = (field: string, value: string, setter: (val: string) => void) => {
    if (value.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()],
      }));
      setter("");
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const getVerticalIcon = () => {
    const vertical = formData.vertical || isv?.vertical;
    switch (vertical) {
      case "manufacturing":
        return "🏭";
      case "smart_cities":
        return "🏙️";
      case "healthcare":
        return "🏥";
      default:
        return "🏢";
    }
  };

  const getInterestColor = (level: string | null | undefined) => {
    if (!level) return "";
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      case "growing":
        return "bg-blue-100 text-blue-800";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="" description="" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!isv) {
    return (
      <div className="flex flex-col h-full">
        <Header title="ISV Not Found" description="" />
        <div className="p-6">
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              The ISV/Startup you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push("/isv-startups")}>
              Back to ISVs
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={isEditMode ? `Edit: ${formData.name}` : isv.name}
        description={`${(formData.vertical || isv.vertical).replace("_", " ")} ISV/Startup`}
        actionButton={
          <div className="flex gap-3">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateISV.isPending}>
                  {updateISV.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push("/isv-startups")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to ISVs
                </Button>
                <Button onClick={() => setIsEditMode(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Overview Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 w-full">
                <div className="text-4xl">{getVerticalIcon()}</div>
                <div className="flex-1">
                  {isEditMode ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="vertical">Vertical</Label>
                          <Select
                            value={formData.vertical}
                            onValueChange={(value) => setFormData({ ...formData, vertical: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {isvVerticals.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="size">Size</Label>
                          <Select
                            value={formData.size}
                            onValueChange={(value) => setFormData({ ...formData, size: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {isvSizes.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="maturityStage">Maturity Stage</Label>
                          <Select
                            value={formData.maturityStage}
                            onValueChange={(value) => setFormData({ ...formData, maturityStage: value })}
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
                        <div>
                          <Label htmlFor="interestLevel">Interest Level</Label>
                          <Select
                            value={formData.interestLevel}
                            onValueChange={(value) => setFormData({ ...formData, interestLevel: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
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
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold">{isv.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {isv.vertical.replace("_", " ")}
                        </Badge>
                        {isv.size && (
                          <Badge variant="secondary">{isv.size}</Badge>
                        )}
                        {isv.maturityStage && (
                          <Badge variant="secondary">{isv.maturityStage}</Badge>
                        )}
                        {isv.interestLevel && (
                          <Badge className={getInterestColor(isv.interestLevel)}>
                            {isv.interestLevel} interest
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input
                    id="headquarters"
                    value={formData.headquarters}
                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                    placeholder="e.g., Singapore"
                  />
                </div>
                <div>
                  <Label htmlFor="employees">Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    placeholder="e.g., 500"
                  />
                </div>
                <div>
                  <Label htmlFor="revenue">Revenue</Label>
                  <Input
                    id="revenue"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="e.g., $50M"
                  />
                </div>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="hasOpenAPIs"
                    checked={formData.hasOpenAPIs}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasOpenAPIs: checked })}
                  />
                  <Label htmlFor="hasOpenAPIs">Has Open APIs</Label>
                  <div className="ml-8 flex items-center space-x-2">
                    <Switch
                      id="dellValidated"
                      checked={formData.dellValidated}
                      onCheckedChange={(checked) => setFormData({ ...formData, dellValidated: checked })}
                    />
                    <Label htmlFor="dellValidated">Dell Validated</Label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isv.headquarters && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">HQ: {isv.headquarters}</span>
                  </div>
                )}
                {isv.employees && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{isv.employees.toLocaleString()} employees</span>
                  </div>
                )}
                {isv.revenue && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Revenue: {isv.revenue}</span>
                  </div>
                )}
                {isv.presence && isv.presence.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Present in {isv.presence.length} countries</span>
                  </div>
                )}
                {isv.hasOpenAPIs && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Open APIs Available</span>
                  </div>
                )}
                {isv.dellValidated && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Dell Validated</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Geographic Presence */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Geographic Presence</h3>
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <Label>Regions</Label>
                  <Select
                    value={formData.regions[0] || ""}
                    onValueChange={(value) => setFormData({ ...formData, regions: value ? [value] : [] })}
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
                <div>
                  <Label>Countries</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="Add country..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('presence', newCountry, setNewCountry);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => addToArray('presence', newCountry, setNewCountry)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.presence?.map((country: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {country}
                        <button
                          onClick={() => removeFromArray('presence', index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {isv.regions && isv.regions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Regions</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.regions.map((region) => (
                        <Badge key={region} variant="outline">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {isv.presence && isv.presence.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Countries</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.presence.map((country) => (
                        <Badge key={country} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Integrations & Partnerships */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Integrations & Partnerships</h3>
            {isEditMode ? (
              <div className="space-y-4">
                {/* Integrations */}
                <div>
                  <Label>Integrations</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newIntegration}
                      onChange={(e) => setNewIntegration(e.target.value)}
                      placeholder="Add integration..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('integrations', newIntegration, setNewIntegration);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => addToArray('integrations', newIntegration, setNewIntegration)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.integrations?.map((integration: string, index: number) => (
                      <Badge key={index} variant="outline">
                        <Link2 className="w-3 h-3 mr-1" />
                        {integration}
                        <button
                          onClick={() => removeFromArray('integrations', index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Consortium Memberships */}
                <div>
                  <Label>Consortium Memberships</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newMembership}
                      onChange={(e) => setNewMembership(e.target.value)}
                      placeholder="Add membership..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('consortiumMemberships', newMembership, setNewMembership);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => addToArray('consortiumMemberships', newMembership, setNewMembership)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.consortiumMemberships?.map((membership: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {membership}
                        <button
                          onClick={() => removeFromArray('consortiumMemberships', index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <Label>Certifications</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add certification..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('certifications', newCertification, setNewCertification);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => addToArray('certifications', newCertification, setNewCertification)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications?.map((cert: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        <Shield className="w-3 h-3 mr-1" />
                        {cert}
                        <button
                          onClick={() => removeFromArray('certifications', index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {isv.integrations && isv.integrations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Integrations</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.integrations.map((integration) => (
                        <Badge key={integration} variant="outline">
                          <Link2 className="w-3 h-3 mr-1" />
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {isv.consortiumMemberships && isv.consortiumMemberships.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Consortium Memberships</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.consortiumMemberships.map((membership) => (
                        <Badge key={membership} variant="secondary">
                          {membership}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {isv.certifications && isv.certifications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Strategic Assessment */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Strategic Assessment</h3>
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="strategicValue">Strategic Value</Label>
                  <Textarea
                    id="strategicValue"
                    value={formData.strategicValue}
                    onChange={(e) => setFormData({ ...formData, strategicValue: e.target.value })}
                    placeholder="Describe the strategic value..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Interest Reasons</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      placeholder="Add reason..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('interestReasons', newReason, setNewReason);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => addToArray('interestReasons', newReason, setNewReason)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.interestReasons?.map((reason: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {reason}
                        <button
                          onClick={() => removeFromArray('interestReasons', index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {isv.strategicValue && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Strategic Value</p>
                    <p className="text-sm">{isv.strategicValue}</p>
                  </div>
                )}
                {isv.interestReasons && isv.interestReasons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Interest Reasons</p>
                    <div className="flex flex-wrap gap-2">
                      {isv.interestReasons.map((reason) => (
                        <Badge key={reason} variant="outline">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            {isEditMode ? (
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes about this ISV..."
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {isv.notes || "No notes added yet."}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}