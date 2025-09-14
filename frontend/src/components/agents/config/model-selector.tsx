'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, Search, AlertTriangle, Crown, Plus, Edit, Trash, KeyRound, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
// Use the unified (new) model selection hook directly
import { useModelSelection } from '@/components/thread/chat-input/_use-model-selection-new';
import { MODELS, DEFAULT_FREE_MODEL_ID, DEFAULT_PREMIUM_MODEL_ID } from '@/components/thread/chat-input/_use-model-selection';
import { formatModelName, getPrefixedModelId } from '@/lib/stores/model-store';
import { useAvailableModels } from '@/hooks/react-query/subscriptions/use-billing';
import { isLocalMode } from '@/lib/config';
import { CustomModelDialog, CustomModelFormData } from '@/components/thread/chat-input/custom-model-dialog';
import { BillingModal } from '@/components/billing/billing-modal';
import Link from 'next/link';

interface CustomModel {
  id: string;
  label: string;
}

interface AgentModelSelectorProps {
  value?: string;
  onChange: (model: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'menu-item';
  className?: string;
}

export function AgentModelSelector({
  value,
  onChange,
  disabled = false,
  variant = 'default',
  className,
}: AgentModelSelectorProps) {
  const { 
    allModels, 
    canAccessModel, 
    subscriptionStatus,
    selectedModel: storeSelectedModel,
    handleModelChange: storeHandleModelChange,
    customModels: storeCustomModels,
    addCustomModel: storeAddCustomModel,
    updateCustomModel: storeUpdateCustomModel,
    removeCustomModel: storeRemoveCustomModel 
  } = useModelSelection();
  const { data: modelsData } = useAvailableModels();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Paywall removed – universal access
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  
  const [isCustomModelDialogOpen, setIsCustomModelDialogOpen] = useState(false);
  const [dialogInitialData, setDialogInitialData] = useState<CustomModelFormData>({ id: '', label: '' });
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingModelId, setEditingModelId] = useState<string | null>(null);

  const customModels = storeCustomModels;
  
  const normalizeModelId = (modelId?: string): string => {
    if (!modelId) return subscriptionStatus === 'active' ? DEFAULT_PREMIUM_MODEL_ID : DEFAULT_FREE_MODEL_ID;
    
    if (modelsData?.models) {
      const exactMatch = modelsData.models.find(m => m.short_name === modelId);
      if (exactMatch) return exactMatch.short_name;

      const fullMatch = modelsData.models.find(m => m.id === modelId);
      if (fullMatch) return fullMatch.short_name || fullMatch.id;
      
      if (modelId.startsWith('openrouter/')) {
        const shortName = modelId.replace('openrouter/', '');
        const shortMatch = modelsData.models.find(m => m.short_name === shortName);
        if (shortMatch) return shortMatch.short_name;
      }
    }
    
    return modelId;
  };
  
  const normalizedValue = normalizeModelId(value);
  
  // Use the prop value if provided, otherwise fall back to store value
  const selectedModel = normalizedValue || storeSelectedModel;

  // Keep store in sync if parent passes a different controlled value
  useEffect(() => {
    if (normalizedValue && normalizedValue !== storeSelectedModel) {
      try {
        if (typeof storeHandleModelChange === 'function') {
          storeHandleModelChange(normalizedValue);
        }
      } catch {}
    }
  }, [normalizedValue, storeSelectedModel, storeHandleModelChange]);

  const enhancedModelOptions = useMemo(() => {
    const modelMap = new Map();

    if (modelsData?.models) {
      modelsData.models.forEach(model => {
        const shortName = model.short_name || model.id;
        const displayName = model.display_name || shortName;
        
        modelMap.set(shortName, {
          id: shortName,
          label: displayName,
          requiresSubscription: model.requires_subscription || false,
          priority: model.priority || 0,
          recommended: model.recommended || false,
          top: (model.priority || 0) >= 90,
          capabilities: model.capabilities || [],
          contextWindow: model.context_window || 128000,
          isCustom: false
        });
      });
    } else {
      // Fallback to allModels if API data not available
      allModels.forEach(model => {
        modelMap.set(model.id, {
          ...model,
          isCustom: false
        });
      });
    }

    if (isLocalMode()) {
      customModels.forEach(model => {
        if (!modelMap.has(model.id)) {
          modelMap.set(model.id, {
            id: model.id,
            label: model.label || formatModelName(model.id),
            requiresSubscription: false,
            top: false,
            isCustom: true
          });
        } else {
          const existingModel = modelMap.get(model.id);
          modelMap.set(model.id, {
            ...existingModel,
            isCustom: true
          });
        }
      });
    }

    return Array.from(modelMap.values());
  }, [modelsData?.models, allModels, customModels]);
  
  const selectedModelDisplay = useMemo(() => {
    const model = enhancedModelOptions.find(m => m.id === selectedModel);
    return model?.label || selectedModel;
  }, [selectedModel, enhancedModelOptions]);

  const filteredOptions = useMemo(() => {
    return enhancedModelOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enhancedModelOptions, searchQuery]);

  const sortedModels = useMemo(() => {
    return [...filteredOptions].sort((a, b) => {
      if (a.requiresSubscription !== b.requiresSubscription) {
        return a.requiresSubscription ? 1 : -1;
      }
      return (b.priority ?? 0) - (a.priority ?? 0);
    });
  }, [filteredOptions]);

  const freeModels = sortedModels.filter(m => !m.requiresSubscription);
  const premiumModels = sortedModels.filter(m => m.requiresSubscription);

  const shouldDisplayAll = !isLocalMode() && premiumModels.length > 0;

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Universal access: all models are selectable without gating
  const handleSelect = (modelId: string) => {
    // Update global/store selection for consistency
    try {
      if (typeof storeHandleModelChange === 'function') {
        storeHandleModelChange(modelId);
      }
    } catch (e) {
      console.warn('Model selector: failed updating store selection', e);
    }
    // Fire external change handler (agent config, etc.)
    onChange(modelId);
    setIsOpen(false);
  };

  const handleUpgradeClick = () => {
    // Billing upgrade no longer needed for model access – repurpose to open billing if desired
    setBillingModalOpen(true);
  };

  // Legacy paywall handlers removed

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const selectedOption = filteredOptions[highlightedIndex];
      if (selectedOption) {
        handleSelect(selectedOption.id);
      }
    }
  };

  const openAddCustomModelDialog = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDialogInitialData({ id: '', label: '' });
    setDialogMode('add');
    setIsCustomModelDialogOpen(true);
    setIsOpen(false);
  };

  const openEditCustomModelDialog = (model: CustomModel, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDialogInitialData({ id: model.id, label: model.label });
    setEditingModelId(model.id);
    setDialogMode('edit');
    setIsCustomModelDialogOpen(true);
    setIsOpen(false);
  };

  const handleSaveCustomModel = (formData: CustomModelFormData) => {
    const modelId = formData.id.trim();
    const displayId = modelId.startsWith('openrouter/') ? modelId.replace('openrouter/', '') : modelId;
    const modelLabel = formData.label.trim() || formatModelName(displayId);

    if (!modelId) return;
    
    const checkId = modelId;
    if (customModels.some(model =>
      model.id === checkId && (dialogMode === 'add' || model.id !== editingModelId))) {
      console.error('A model with this ID already exists');
      return;
    }

    closeCustomModelDialog();
    const newModel = { id: modelId, label: modelLabel };

    if (dialogMode === 'add') {
      storeAddCustomModel(newModel);
      onChange(modelId);
    } else {
      storeUpdateCustomModel(editingModelId!, newModel);
      if (selectedModel === editingModelId) {
        onChange(modelId);
      }
    }
    
    setIsOpen(false);
  };

  const closeCustomModelDialog = () => {
    setIsCustomModelDialogOpen(false);
    setDialogInitialData({ id: '', label: '' });
    setEditingModelId(null);
  };

  const handleDeleteCustomModel = (modelId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    storeRemoveCustomModel(modelId);
    
    if (selectedModel === modelId) {
      const defaultModel = subscriptionStatus === 'active' ? DEFAULT_PREMIUM_MODEL_ID : DEFAULT_FREE_MODEL_ID;
      onChange(defaultModel);
    }
  };

  const renderModelOption = (model: any, index: number) => {
    const isCustom = Boolean(model.isCustom) || 
      (isLocalMode() && customModels.some(m => m.id === model.id));
  // All models accessible now
  const accessible = true;
    const isHighlighted = index === highlightedIndex;
  // Premium distinction removed (retain flag if needed for future styling)
  const isPremium = false;
    const isLowQuality = MODELS[model.id]?.lowQuality || false;
    const isRecommended = MODELS[model.id]?.recommended || false;

    return (
      <Tooltip key={`model-${model.id}-${index}`}>
        <TooltipTrigger asChild>
            <div className='w-full'>
              <DropdownMenuItem
                className={cn(
                  "text-sm px-3 rounded-lg py-2 mx-2 my-0.5 flex items-center justify-between cursor-pointer",
                  isHighlighted && "bg-accent",
                  !accessible && !disabled && "opacity-70"
                )}
                onClick={() => !disabled && handleSelect(model.id)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{model.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isLowQuality && (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  {isRecommended && (
                    <span className="text-xs px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium">
                      Recommended
                    </span>
                  )}
                  {/* Premium crown removed since all models are accessible */}
                  {isLocalMode() && isCustom && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCustomModelDialog(model, e);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomModel(model.id, e);
                        }}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </DropdownMenuItem>
            </div>
          </TooltipTrigger>
          {isLowQuality ? (
            <TooltipContent side="left" className="text-xs max-w-xs">
              <p>Not recommended for complex tasks</p>
            </TooltipContent>
          ) : isRecommended ? (
            <TooltipContent side="left" className="text-xs max-w-xs">
              <p>Recommended for optimal performance</p>
            </TooltipContent>
          ) : isCustom ? (
            <TooltipContent side="left" className="text-xs max-w-xs">
              <p>Custom model</p>
            </TooltipContent>
          ) : null}
        </Tooltip>
    );
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild disabled={disabled}>
                {variant === 'menu-item' ? (
                  <div
                    className={cn(
                      "flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 mx-0 my-0.5 text-sm hover:bg-accent",
                      disabled && "opacity-50 cursor-not-allowed",
                      className
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{selectedModelDisplay}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {MODELS[selectedModel]?.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium">
                          Recommended
                        </span>
                      )}
                      <Check className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 px-3 py-2",
                      disabled && "opacity-50 cursor-not-allowed",
                      className
                    )}
                  >
                    <span className="text-sm truncate max-w-[200px]">{selectedModelDisplay}</span>
                    <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
                  </Button>
                )}
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side={variant === 'menu-item' ? 'left' : 'top'} className="text-xs">
              <p>Choose a model for this agent</p>
            </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align={variant === 'menu-item' ? 'end' : 'start'}
          className="w-76 p-0 overflow-hidden"
          sideOffset={variant === 'menu-item' ? 8 : 4}
        >
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent w-full">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground p-2 px-4">All Models</span>
                {isLocalMode() && (
                  <div className="flex items-center gap-1 p-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                          <Link
                            href="/settings/env-manager"
                            className="h-6 w-6 p-0 flex items-center justify-center"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          Local .Env Manager
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddCustomModelDialog(e);
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          Add a custom model
                        </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="px-1 py-1">
                <div className="relative px-1 flex items-center">
                  <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchInputKeyDown}
                    className="w-full h-8 px-8 py-1 rounded-lg text-sm focus:outline-none bg-muted"
                  />
                </div>
              </div>
              
              {shouldDisplayAll ? (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    All models are available. Usage charges only.
                  </div>
                  {freeModels.concat(premiumModels).map((model, index) => renderModelOption(model, index))}
                  {/* Premium section removed as gating is disabled */}
                  {false && premiumModels.length > 0 && (
                    <>
                      <div className="mt-4 border-t border-border pt-2">
                        <div className="px-3 py-1.5 text-xs font-medium text-blue-500 flex items-center">
                          <Crown className="h-3.5 w-3.5 mr-1.5" />
                          All Models (Unified)
                        </div>
                        <div className="relative overflow-hidden" style={{ maxHeight: 'none' }}>
                          {premiumModels.map((model, index) => {
                            const canAccess = true;
                            const isRecommended = model.recommended;
                            
                            return (
                              <Tooltip key={`premium-${model.id}-${index}`}>
                                <TooltipTrigger asChild>
                                    <div className='w-full'>
                                      <DropdownMenuItem
                                        className={cn(
                                          "text-sm px-3 rounded-lg py-2 mx-2 my-0.5 flex items-center justify-between cursor-pointer",
                                          !canAccess && "opacity-70"
                                        )}
                                        onClick={() => handleSelect(model.id)}
                                      >
                                        <div className="flex items-center">
                                          <span className="font-medium">{model.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {isRecommended && (
                                            <span className="text-xs px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium whitespace-nowrap">
                                              Recommended
                                            </span>
                                          )}
                                          {!canAccess && <Crown className="h-3.5 w-3.5 text-blue-500" />}
                                          {selectedModel === model.id && (
                                            <Check className="h-4 w-4 text-blue-500" />
                                          )}
                                        </div>
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="text-xs max-w-xs">
                                    <p>
                                      {canAccess 
                                        ? (isRecommended ? 'Recommended for optimal performance' : 'Premium model') 
                                        : 'Requires subscription to access premium model'
                                      }
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                            );
                          })}
                          {/* Upgrade overlay removed */}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {sortedModels.length > 0 ? (
                    sortedModels.map((model, index) => renderModelOption(model, index))
                  ) : (
                    <div className="text-sm text-center py-4 text-muted-foreground">
                      No models match your search
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {isLocalMode() && (
        <CustomModelDialog
          isOpen={isCustomModelDialogOpen}
          onClose={closeCustomModelDialog}
          onSave={handleSaveCustomModel}
          initialData={dialogInitialData}
          mode={dialogMode}
        />
      )}
  {/* Paywall dialog removed since all models are accessible */}
      <BillingModal
        open={billingModalOpen}
        onOpenChange={setBillingModalOpen}
      />
    </div>
  );
}
