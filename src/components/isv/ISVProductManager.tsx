import React, { useState } from 'react';
import { ValueChainStage } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  GitBranch,
  Layers,
  Database,
  Cpu,
  HardDrive,
  Brain,
  Monitor,
} from 'lucide-react';

interface ISVProduct {
  id?: string;
  name: string;
  description: string;
  features: string[];
  stage: ValueChainStage;
  integrationType?: 'compatible' | 'certified' | 'optimized' | 'native';
}

interface ISVProductManagerProps {
  valueChainStages: ValueChainStage[];
  products: ISVProduct[];
  solutionsByStage: Record<string, any[]>;
  technologyOffering: Record<string, string[]>;
  valueChainCapabilities: Record<string, string[]>;
  onUpdate: (data: {
    valueChainStages: ValueChainStage[];
    products: ISVProduct[];
    solutionsByStage: Record<string, any[]>;
    technologyOffering: Record<string, string[]>;
    valueChainCapabilities: Record<string, string[]>;
  }) => void;
  isEditMode: boolean;
}

const stageInfo = {
  [ValueChainStage.DATA_CAPTURE_INGESTION]: {
    label: 'Data Capture & Ingestion',
    icon: Database,
    color: 'blue',
    description: 'Collect and ingest data from IoT devices and sensors',
  },
  [ValueChainStage.EDGE_PROCESSING]: {
    label: 'Edge Processing',
    icon: Cpu,
    color: 'purple',
    description: 'Process and analyze data at the edge',
  },
  [ValueChainStage.STORAGE_MANAGEMENT]: {
    label: 'Storage & Management',
    icon: HardDrive,
    color: 'green',
    description: 'Store and manage large-scale data',
  },
  [ValueChainStage.COMPUTE_SIMULATION]: {
    label: 'Compute & Simulation',
    icon: Brain,
    color: 'orange',
    description: 'Run simulations and AI models',
  },
  [ValueChainStage.VISUALIZATION_DECISION]: {
    label: 'Visualization & Decision',
    icon: Monitor,
    color: 'indigo',
    description: 'Visualize insights and make decisions',
  },
};

export function ISVProductManager({
  valueChainStages,
  products,
  solutionsByStage,
  technologyOffering,
  valueChainCapabilities,
  onUpdate,
  isEditMode,
}: ISVProductManagerProps) {
  const [selectedStages, setSelectedStages] = useState<ValueChainStage[]>(valueChainStages);
  const [productList, setProductList] = useState<ISVProduct[]>(products);
  const [editingProduct, setEditingProduct] = useState<ISVProduct | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [stageCapabilities, setStageCapabilities] = useState(valueChainCapabilities);
  const [stageTechnologies, setStageTechnologies] = useState(technologyOffering);
  const [newCapability, setNewCapability] = useState('');
  const [newTechnology, setNewTechnology] = useState('');
  const [selectedStageForEdit, setSelectedStageForEdit] = useState<ValueChainStage | null>(null);

  // Handle stage selection
  const toggleStage = (stage: ValueChainStage) => {
    if (!isEditMode) return;

    if (selectedStages.includes(stage)) {
      setSelectedStages(selectedStages.filter(s => s !== stage));
      // Remove products for this stage
      setProductList(productList.filter(p => p.stage !== stage));
    } else {
      setSelectedStages([...selectedStages, stage]);
    }
  };

  // Add/Edit product
  const saveProduct = () => {
    if (!editingProduct) return;

    if (editingProduct.id) {
      // Update existing product
      setProductList(productList.map(p =>
        p.id === editingProduct.id ? editingProduct : p
      ));
    } else {
      // Add new product
      setProductList([...productList, { ...editingProduct, id: Date.now().toString() }]);
    }

    setEditingProduct(null);
    setShowProductDialog(false);
  };

  // Delete product
  const deleteProduct = (productId: string) => {
    setProductList(productList.filter(p => p.id !== productId));
  };

  // Add capability to stage
  const addCapability = (stage: ValueChainStage) => {
    if (!newCapability.trim()) return;

    const updatedCapabilities = {
      ...stageCapabilities,
      [stage]: [...(stageCapabilities[stage] || []), newCapability.trim()],
    };
    setStageCapabilities(updatedCapabilities);
    setNewCapability('');
  };

  // Add technology to stage
  const addTechnology = (stage: ValueChainStage) => {
    if (!newTechnology.trim()) return;

    const updatedTechnologies = {
      ...stageTechnologies,
      [stage]: [...(stageTechnologies[stage] || []), newTechnology.trim()],
    };
    setStageTechnologies(updatedTechnologies);
    setNewTechnology('');
  };

  // Remove capability
  const removeCapability = (stage: ValueChainStage, index: number) => {
    const updatedCapabilities = {
      ...stageCapabilities,
      [stage]: stageCapabilities[stage]?.filter((_, i) => i !== index) || [],
    };
    setStageCapabilities(updatedCapabilities);
  };

  // Remove technology
  const removeTechnology = (stage: ValueChainStage, index: number) => {
    const updatedTechnologies = {
      ...stageTechnologies,
      [stage]: stageTechnologies[stage]?.filter((_, i) => i !== index) || [],
    };
    setStageTechnologies(updatedTechnologies);
  };

  // Save all changes
  const handleSave = () => {
    onUpdate({
      valueChainStages: selectedStages,
      products: productList,
      solutionsByStage: solutionsByStage, // This could be enhanced
      technologyOffering: stageTechnologies,
      valueChainCapabilities: stageCapabilities,
    });
  };

  if (!isEditMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Value Chain Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enter edit mode to configure value chain stages, products, and capabilities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stage Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Value Chain Stages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose which stages this ISV covers in the Digital Twin value chain
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stageInfo).map(([stage, info]) => {
              const Icon = info.icon;
              const isSelected = selectedStages.includes(stage as ValueChainStage);

              return (
                <div
                  key={stage}
                  onClick={() => toggleStage(stage as ValueChainStage)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected
                      ? `bg-${info.color}-50 border-${info.color}-300`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleStage(stage as ValueChainStage)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 text-${info.color}-600`} />
                        <p className="font-medium">{info.label}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Products Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Products & Solutions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage ISV products and map them to value chain stages
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  description: '',
                  features: [],
                  stage: selectedStages[0] || ValueChainStage.DATA_CAPTURE_INGESTION,
                });
                setShowProductDialog(true);
              }}
              disabled={selectedStages.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {productList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products added yet. Add products to show ISV offerings.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productList.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <Badge variant="outline" className="mt-1">
                        {stageInfo[product.stage]?.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteProduct(product.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.description}
                  </p>
                  {product.integrationType && (
                    <Badge className="text-xs">
                      {product.integrationType} integration
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Capabilities & Technologies */}
      {selectedStages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stage Capabilities & Technologies</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define capabilities and technologies for each selected stage
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {selectedStages.map((stage) => {
                const info = stageInfo[stage];
                const Icon = info.icon;

                return (
                  <AccordionItem key={stage} value={stage}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 text-${info.color}-600`} />
                        {info.label}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {/* Capabilities */}
                      <div>
                        <Label className="text-sm font-medium mb-2">Capabilities</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add capability..."
                            value={selectedStageForEdit === stage ? newCapability : ''}
                            onChange={(e) => {
                              setSelectedStageForEdit(stage);
                              setNewCapability(e.target.value);
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addCapability(stage);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedStageForEdit(stage);
                              addCapability(stage);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {stageCapabilities[stage]?.map((cap, idx) => (
                            <Badge key={idx} variant="outline">
                              {cap}
                              <button
                                onClick={() => removeCapability(stage, idx)}
                                className="ml-2 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Technologies */}
                      <div>
                        <Label className="text-sm font-medium mb-2">Technologies</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add technology..."
                            value={selectedStageForEdit === stage ? newTechnology : ''}
                            onChange={(e) => {
                              setSelectedStageForEdit(stage);
                              setNewTechnology(e.target.value);
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addTechnology(stage);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedStageForEdit(stage);
                              addTechnology(stage);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {stageTechnologies[stage]?.map((tech, idx) => (
                            <Badge key={idx} variant="secondary">
                              {tech}
                              <button
                                onClick={() => removeTechnology(stage, idx)}
                                className="ml-2 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Value Chain Configuration
        </Button>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="product-stage">Value Chain Stage</Label>
                <Select
                  value={editingProduct.stage}
                  onValueChange={(value) =>
                    setEditingProduct({
                      ...editingProduct,
                      stage: value as ValueChainStage,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stageInfo[stage].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="integration-type">Dell Integration Type</Label>
                <Select
                  value={editingProduct.integrationType || 'compatible'}
                  onValueChange={(value) =>
                    setEditingProduct({
                      ...editingProduct,
                      integrationType: value as ISVProduct['integrationType'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compatible">Compatible</SelectItem>
                    <SelectItem value="certified">Certified</SelectItem>
                    <SelectItem value="optimized">Optimized</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Features</Label>
                <div className="space-y-2">
                  {editingProduct.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editingProduct.features];
                          newFeatures[idx] = e.target.value;
                          setEditingProduct({
                            ...editingProduct,
                            features: newFeatures,
                          });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProduct({
                            ...editingProduct,
                            features: editingProduct.features.filter(
                              (_, i) => i !== idx
                            ),
                          });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditingProduct({
                        ...editingProduct,
                        features: [...editingProduct.features, ''],
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveProduct}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}