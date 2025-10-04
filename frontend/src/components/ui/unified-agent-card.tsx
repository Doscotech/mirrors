'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Download, CheckCircle, Loader2, Globe, GlobeLock, GitBranch, Trash2, MoreVertical, User, ArrowRight } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { KortixLogo } from '@/components/sidebar/kortix-logo';
import { AgentAvatar } from '@/components/thread/content/agent-avatar';

// Unified agent card variants
export type AgentCardVariant = 
  | 'onboarding'      // Selection card for onboarding
  | 'marketplace'     // Marketplace template card
  | 'template'        // User template card
  | 'agent'          // User agent card
  | 'showcase'       // Home page showcase
  | 'dashboard'      // Dashboard quick access
  | 'compact';       // Compact version

// Base agent data interface
export interface BaseAgentData {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  created_at?: string;
  icon?: string;
  role?: string;
  capabilities?: string[];
  
  // Icon/avatar data
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  
  // Marketplace specific
  creator_id?: string;
  creator_name?: string;
  is_kortix_team?: boolean;
  download_count?: number;
  marketplace_published_at?: string;
  
  // Template specific
  template_id?: string;
  is_public?: boolean;
  
  // Agent specific
  agent_id?: string;
  is_default?: boolean;
  current_version?: {
    version_id: string;
    version_name: string;
    version_number: number;
  };
  metadata?: {
    is_suna_default?: boolean;
    centrally_managed?: boolean;
    restrictions?: Record<string, boolean>;
  };
}

// Action handlers
export interface AgentCardActions {
  onPrimaryAction?: (data: BaseAgentData, e?: React.MouseEvent) => void;
  onSecondaryAction?: (data: BaseAgentData, e?: React.MouseEvent) => void;
  onDeleteAction?: (data: BaseAgentData, e?: React.MouseEvent) => void;
  onClick?: (data: BaseAgentData) => void;
  onToggle?: (agentId: string) => void;
}

// Card state
export interface AgentCardState {
  isSelected?: boolean;
  isRecommended?: boolean;
  isActioning?: boolean;
  isDeleting?: boolean;
}

// Main props interface
export interface UnifiedAgentCardProps {
  variant: AgentCardVariant;
  data: BaseAgentData;
  actions?: AgentCardActions;
  state?: AgentCardState;
  
  // Styling
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  
  // Animation
  delay?: number;
  
  // Context
  currentUserId?: string;
}

// Color theme mapping based on tags
const getColorFromTags = (tags?: string[]): string => {
  if (!tags || tags.length === 0) return 'default';
  
  const tagColorMap: Record<string, string> = {
    'productivity': 'blue',
    'code': 'purple',
    'developer': 'purple',
    'programming': 'purple',
    'writing': 'amber',
    'content': 'amber',
    'data': 'cyan',
    'analytics': 'cyan',
    'design': 'pink',
    'creative': 'pink',
    'sales': 'orange',
    'marketing': 'orange',
    'support': 'green',
    'customer': 'green',
    'research': 'purple',
    'finance': 'emerald',
    'accounting': 'emerald',
  };
  
  // Find first matching tag
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    for (const [key, color] of Object.entries(tagColorMap)) {
      if (lowerTag.includes(key)) {
        return color;
      }
    }
  }
  
  // Consistent fallback color from tag hash
  const hash = tags[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan', 'amber'];
  return colors[hash % colors.length];
};

const getCardColorClasses = (color: string) => {
  const colorMap = {
    purple: {
      bg: 'from-purple-50/95 to-purple-100/50 dark:from-purple-950/95 dark:to-purple-900/50',
      border: 'border-purple-200/40 hover:border-purple-400/40 dark:border-purple-800/40 dark:hover:border-purple-600/40',
      glow: 'from-purple-500/20 to-purple-400/5',
    },
    blue: {
      bg: 'from-blue-50/95 to-blue-100/50 dark:from-blue-950/95 dark:to-blue-900/50',
      border: 'border-blue-200/40 hover:border-blue-400/40 dark:border-blue-800/40 dark:hover:border-blue-600/40',
      glow: 'from-blue-500/20 to-blue-400/5',
    },
    green: {
      bg: 'from-emerald-50/95 to-emerald-100/50 dark:from-emerald-950/95 dark:to-emerald-900/50',
      border: 'border-emerald-200/40 hover:border-emerald-400/40 dark:border-emerald-800/40 dark:hover:border-emerald-600/40',
      glow: 'from-emerald-500/20 to-emerald-400/5',
    },
    emerald: {
      bg: 'from-emerald-50/95 to-emerald-100/50 dark:from-emerald-950/95 dark:to-emerald-900/50',
      border: 'border-emerald-200/40 hover:border-emerald-400/40 dark:border-emerald-800/40 dark:hover:border-emerald-600/40',
      glow: 'from-emerald-500/20 to-emerald-400/5',
    },
    orange: {
      bg: 'from-orange-50/95 to-orange-100/50 dark:from-orange-950/95 dark:to-orange-900/50',
      border: 'border-orange-200/40 hover:border-orange-400/40 dark:border-orange-800/40 dark:hover:border-orange-600/40',
      glow: 'from-orange-500/20 to-orange-400/5',
    },
    pink: {
      bg: 'from-pink-50/95 to-pink-100/50 dark:from-pink-950/95 dark:to-pink-900/50',
      border: 'border-pink-200/40 hover:border-pink-400/40 dark:border-pink-800/40 dark:hover:border-pink-600/40',
      glow: 'from-pink-500/20 to-pink-400/5',
    },
    cyan: {
      bg: 'from-cyan-50/95 to-cyan-100/50 dark:from-cyan-950/95 dark:to-cyan-900/50',
      border: 'border-cyan-200/40 hover:border-cyan-400/40 dark:border-cyan-800/40 dark:hover:border-cyan-600/40',
      glow: 'from-cyan-500/20 to-cyan-400/5',
    },
    amber: {
      bg: 'from-amber-50/95 to-amber-100/50 dark:from-amber-950/95 dark:to-amber-900/50',
      border: 'border-amber-200/40 hover:border-amber-400/40 dark:border-amber-800/40 dark:hover:border-amber-600/40',
      glow: 'from-amber-500/20 to-amber-400/5',
    },
    default: {
      bg: 'from-card/95 to-card/50',
      border: 'border-border/40 hover:border-primary/40',
      glow: 'from-primary/20 to-primary/5',
    }
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.default;
};

// Avatar component
const CardAvatar: React.FC<{ 
  data: BaseAgentData;
  size?: number;
  variant: AgentCardVariant;
}> = ({ data, size = 48, variant }) => {
  const isSunaAgent = data.metadata?.is_suna_default === true;
  
  if (variant === 'showcase') {
    return (
      <motion.div 
        className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300"
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        {data.icon}
      </motion.div>
    );
  }
  
  if (isSunaAgent) {
    return (
      <AgentAvatar
        isSunaDefault={true}
        size={size}
        className="border"
      />
    );
  }
  
  if (data.icon_name) {
    return (
      <AgentAvatar
        iconName={data.icon_name}
        iconColor={data.icon_color}
        backgroundColor={data.icon_background}
        agentName={data.name}
        size={size}
      />
    );
  }
  
  // Fallback avatar
  return (
    <AgentAvatar
      agentName={data.name}
      size={size}
      className="border"
    />
  );
};

// Badge components
const MarketplaceBadge: React.FC<{ 
  isKortixTeam?: boolean; 
  isOwner?: boolean;
}> = ({ isKortixTeam, isOwner }) => (
  <div className="flex gap-1.5 flex-wrap">
    {isKortixTeam && (
      <Badge variant="secondary" className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 border-blue-200/50 shadow-sm dark:from-blue-950 dark:to-blue-900 dark:text-blue-300 dark:border-blue-800/50 font-medium">
        <CheckCircle className="h-3 w-3 mr-1" />
        Xera
      </Badge>
    )}
    {isOwner && (
      <Badge variant="secondary" className="bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300 dark:border-emerald-800/50 font-medium">
        Owner
      </Badge>
    )}
  </div>
);

const TemplateBadge: React.FC<{ isPublic?: boolean }> = ({ isPublic }) => {
  if (isPublic) {
    return (
      <Badge variant="default" className="bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300 dark:border-emerald-800/50 font-medium">
        <Globe className="h-3 w-3" />
        Public
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 border-gray-200/50 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-gray-300 dark:border-gray-700/50 font-medium">
      <GlobeLock className="h-3 w-3" />
      Private
    </Badge>
  );
};

const AgentBadges: React.FC<{ data: BaseAgentData, isSunaAgent: boolean }> = ({ data, isSunaAgent }) => (
  <div className="flex gap-1.5">
    {!isSunaAgent && data.current_version && (
      <Badge variant="outline" className="text-xs border-border/50 shadow-sm font-medium">
        <GitBranch className="h-3 w-3 mr-1" />
        {data.current_version.version_name}
      </Badge>
    )}
    {!isSunaAgent && data.is_public && (
      <Badge variant="default" className="bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300 dark:border-emerald-800/50 text-xs font-medium">
        <Globe className="h-3 w-3 mr-1" />
        Published
      </Badge>
    )}
  </div>
);

// Tag list component
const TagList: React.FC<{ tags?: string[]; maxTags?: number }> = ({ tags, maxTags = 3 }) => (
  <div className="flex flex-wrap gap-1.5 min-h-[1.25rem]">
    {tags && tags.length > 0 && (
      <>
        {tags.slice(0, maxTags).map(tag => (
          <Badge key={tag} variant="outline" className="text-xs border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors font-medium">
            {tag}
          </Badge>
        ))}
        {tags.length > maxTags && (
          <Badge variant="outline" className="text-xs border-border/40 bg-muted/30 font-medium">
            +{tags.length - maxTags}
          </Badge>
        )}
      </>
    )}
  </div>
);

// Capabilities list for onboarding
const CapabilitiesList: React.FC<{ capabilities?: string[]; maxCapabilities?: number }> = ({ 
  capabilities, 
  maxCapabilities = 3 
}) => (
  <div className="flex flex-wrap gap-1">
    {capabilities && capabilities.length > 0 && (
      <>
        {capabilities.slice(0, maxCapabilities).map((capability) => (
          <Badge key={capability} variant="outline" className="text-xs">
            {capability}
          </Badge>
        ))}
        {capabilities.length > maxCapabilities && (
          <Badge variant="outline" className="text-xs">
            +{capabilities.length - maxCapabilities} more
          </Badge>
        )}
      </>
    )}
  </div>
);

// Main unified agent card component
export const UnifiedAgentCard: React.FC<UnifiedAgentCardProps> = ({
  variant,
  data,
  actions = {},
  state = {},
  className,
  size = 'md',
  delay = 0,
  currentUserId
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  
  const {
    onPrimaryAction,
    onSecondaryAction,
    onDeleteAction,
    onClick,
    onToggle
  } = actions;
  
  const {
    isSelected = false,
    isRecommended = false,
    isActioning = false,
    isDeleting = false
  } = state;
  
  const isSunaAgent = data.metadata?.is_suna_default === true;
  const isOwner = currentUserId && data.creator_id === currentUserId;
  
  // Handle delete confirmation
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDeleteAction?.(data);
  };
  
  // Render different variants
  const renderShowcaseCard = () => (
    <motion.div className="flex flex-col items-start justify-end min-h-[400px] relative group cursor-pointer hover:bg-accent/30 transition-colors duration-300">
      <div className="relative flex size-full items-center justify-center h-full overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-background to-transparent z-20"></div>
        
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center">
          <CardAvatar data={data} variant={variant} />
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold tracking-tighter group-hover:text-primary transition-colors">
              {data.name}
            </h3>
            <p className="text-sm text-primary/70 font-medium uppercase tracking-wider">
              {data.role}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {data.description}
            </p>
          </div>

          <motion.button
            className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-300"
            initial={{ y: 10 }}
            whileHover={{ y: 0 }}
            onClick={() => onClick?.(data)}
          >
            Try {data.name} 
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
  
  const renderDashboardCard = () => (
    <div
      className={cn(
        'group relative bg-muted/30 rounded-3xl overflow-hidden transition-all duration-300 border cursor-pointer flex flex-col w-full border-border/50',
        'hover:border-primary/20',
        className
      )}
      onClick={() => onClick?.(data)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="h-full relative flex flex-col overflow-hidden w-full p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CardAvatar data={data} size={40} variant={variant} />
          </div>
          <h3 className="text-base font-semibold text-foreground line-clamp-1 flex-1 min-w-0">
            {data.name}
          </h3>
        </div>
      </div>
    </div>
  );
  
  const renderOnboardingCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative"
    >
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 relative overflow-hidden',
          isSelected 
            ? 'border-2 border-foreground bg-background' 
            : 'border border-border hover:border-muted-foreground/30',
          className
        )}
        onClick={() => onToggle?.(data.id)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with name and selection */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight">{data.name}</h3>
              <p className="text-xs text-muted-foreground leading-tight">{data.role}</p>
            </div>
            
            {/* Selection indicator */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              
              {isSelected ? (
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {data.description}
          </p>
          
          {/* Capabilities - compact */}
          {data.capabilities && data.capabilities.length > 0 && (
            <div className="space-y-1">
              {data.capabilities.slice(0, 3).map((capability) => (
                <div key={capability} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="mt-1 w-0.5 h-0.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                  <span className="leading-tight">{capability}</span>
                </div>
              ))}
              {data.capabilities.length > 3 && (
                <div className="text-[11px] text-muted-foreground pl-2">
                  +{data.capabilities.length - 3} more
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const renderStandardCard = () => {
    // Get color based on tags
    const cardColor = getColorFromTags(data.tags);
    const colorClasses = getCardColorClasses(cardColor);
    
    const cardClassName = cn(
      'group relative bg-gradient-to-br backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 border cursor-pointer flex flex-col hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
      colorClasses.bg,
      colorClasses.border,
      className
    );
    
    const renderBadge = () => {
      switch (variant) {
        case 'marketplace':
          return <MarketplaceBadge isKortixTeam={data.is_kortix_team} isOwner={isOwner} />;
        case 'template':
          return <TemplateBadge isPublic={data.is_public} />;
        case 'agent':
          return <AgentBadges data={data} isSunaAgent={isSunaAgent} />;
        default:
          return null;
      }
    };
    
    const renderMetadata = () => {
      if (variant === 'marketplace') {
        return (
          <div className="flex items-center justify-between text-xs text-muted-foreground/80">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/40">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium">{data.creator_name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 text-primary">
              <Download className="h-3.5 w-3.5" />
              <span className="font-semibold">{data.download_count || 0}</span>
            </div>
          </div>
        );
      }
      
      if ((variant === 'template' || variant === 'agent') && data.is_public && data.download_count && data.download_count > 0) {
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-full bg-primary/5">
            <Download className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{data.download_count} downloads</span>
          </div>
        );
      }
      
      return null;
    };
    
    const renderActions = () => {
      if (variant === 'marketplace') {
        return (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onPrimaryAction?.(data, e);
              }}
              disabled={isActioning}
              className="flex-1 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
              size="sm"
            >
              {isActioning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </>
              )}
            </Button>
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="px-2 rounded-xl border-border/50 hover:border-border hover:bg-accent/50"
                    disabled={isActioning}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleDeleteClick}>
                    <Trash2 className="h-4 w-4" />
                    Delete Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      }
      
      if (variant === 'template') {
        return (
          <div className="space-y-2">
            <Button
              onClick={(e) => onPrimaryAction?.(data, e)}
              disabled={isActioning}
              variant={data.is_public ? "outline" : "default"}
              className="w-full rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
              size="sm"
            >
              {isActioning ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {data.is_public ? 'Unpublishing...' : 'Publishing...'}
                </>
              ) : (
                <>
                  {data.is_public ? (
                    <>
                      <GlobeLock className="h-3 w-3" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      Publish to Marketplace
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        );
      }
      
      return null;
    };
    
    return (
      <div className={cardClassName} onClick={() => onClick?.(data)}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Glow effect - color-specific */}
        <div className={cn(
          "absolute -inset-[1px] bg-gradient-to-br rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10",
          colorClasses.glow
        )} />
        
        <div className="relative p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <CardAvatar data={data} variant={variant} />
              {/* Avatar glow on hover */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            </div>
            <div className="flex items-center gap-2">
              {renderBadge()}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {data.name}
          </h3>
          
          <div className="flex-1 flex flex-col">
            <div className="min-h-[1.25rem] mb-3">
              <TagList tags={data.tags} />
            </div>
            
            <div className="mt-auto space-y-3">
              {renderMetadata()}
              {renderActions()}
            </div>
          </div>
        </div>
        
        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "<strong>{data.name}</strong>"? This will permanently remove it from the marketplace and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmDelete();
                }}
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                {isActioning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Template'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };
  
  // Render based on variant
  switch (variant) {
    case 'showcase':
      return renderShowcaseCard();
    case 'dashboard':
    case 'compact':
      return renderDashboardCard();
    case 'onboarding':
      return renderOnboardingCard();
    default:
      return renderStandardCard();
  }
};

// Export legacy component names for backward compatibility
export const AgentCard = UnifiedAgentCard;
export default UnifiedAgentCard;
