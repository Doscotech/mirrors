"use client";

import React from 'react';
import { Globe, Grid3X3, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchBar } from './search-bar';
import { MarketplaceSectionHeader } from './marketplace-section-header';
import { UnifiedAgentCard } from '@/components/ui/unified-agent-card';
import { Pagination } from '../pagination';
import { CURATED_FEATURED_TEMPLATE_IDS } from '@/components/agents/discover/featured-curated';
import { DiscoverHeader } from '@/components/agents/discover/DiscoverHeader';
import { FiltersBar } from '@/components/agents/discover/FiltersBar';
import { SpotlightRow } from '@/components/agents/discover/SpotlightRow';
import { TabsNavigation } from './tabs-navigation';
import UnicornLightning from '@/components/visuals/unicorn-lightning';
import { Toggle } from '@/components/ui/toggle';
import { useCommandCenter } from '@/contexts/CommandCenterContext';

import type { MarketplaceTemplate } from '@/components/agents/installation/types';

interface MarketplaceTabProps {
  marketplaceSearchQuery: string;
  setMarketplaceSearchQuery: (value: string) => void;
  marketplaceFilter: 'all' | 'kortix' | 'community' | 'mine';
  setMarketplaceFilter: (value: 'all' | 'kortix' | 'community' | 'mine') => void;
  marketplaceLoading: boolean;
  allMarketplaceItems: MarketplaceTemplate[];
  mineItems: MarketplaceTemplate[];
  installingItemId: string | null;
  onInstallClick: (item: MarketplaceTemplate, e?: React.MouseEvent) => void;
  onDeleteTemplate?: (item: MarketplaceTemplate, e?: React.MouseEvent) => void;
  getItemStyling: (item: MarketplaceTemplate) => { color: string };
  currentUserId?: string;
  onAgentPreview?: (agent: MarketplaceTemplate) => void;
  // New: sorting and tags wiring
  marketplaceSelectedTags?: string[];
  setMarketplaceSelectedTags?: (tags: string[]) => void;
  marketplaceSortBy?: 'newest' | 'popular' | 'most_downloaded' | 'name';
  setMarketplaceSortBy?: (s: 'newest' | 'popular' | 'most_downloaded' | 'name') => void;
  // View mode
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  
  marketplacePage: number;
  setMarketplacePage: (page: number) => void;
  marketplacePageSize: number;
  onMarketplacePageSizeChange: (pageSize: number) => void;
  marketplacePagination?: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  onTabChange?: (tab: string) => void;
}

export const MarketplaceTab = ({
  marketplaceSearchQuery,
  setMarketplaceSearchQuery,
  marketplaceFilter,
  setMarketplaceFilter,
  marketplaceLoading,
  allMarketplaceItems,
  mineItems,
  installingItemId,
  onInstallClick,
  onDeleteTemplate,
  getItemStyling,
  currentUserId,
  onAgentPreview,
  marketplaceSelectedTags = [],
  setMarketplaceSelectedTags,
  marketplaceSortBy = 'popular',
  setMarketplaceSortBy,
  marketplacePage,
  setMarketplacePage,
  marketplacePageSize,
  onMarketplacePageSizeChange,
  marketplacePagination,
  onTabChange,
  viewMode,
  setViewMode
}: MarketplaceTabProps) => {
  const router = useRouter();
  const { activeCategory } = useCommandCenter();

  const handleAgentClick = (item: MarketplaceTemplate) => {
    // Use the dedicated preview page
    router.push(`/agents/preview/${item.id}`);
  };

  // Category filtering logic
  const getCategoryTags = (category: string): string[] => {
    const categoryMappings: Record<string, string[]> = {
      'academic': ['academic', 'research', 'education', 'learning', 'study', 'science', 'math', 'writing', 'analysis'],
      'osint': ['osint', 'intelligence', 'investigation', 'research', 'security', 'analysis', 'data', 'web', 'search'],
      'entertainment': ['entertainment', 'music', 'video', 'gaming', 'fun', 'creative', 'media', 'art'],
      'games': ['gaming', 'games', 'entertainment', 'fun', 'strategy', 'puzzle', 'arcade'],
      'productivity': ['productivity', 'organization', 'management', 'workflow', 'automation', 'efficiency', 'business'],
      'creative': ['creative', 'art', 'design', 'writing', 'music', 'video', 'content', 'media'],
      'utilities': ['utility', 'tools', 'helper', 'converter', 'calculator', 'formatter', 'automation'],
      'coding': ['coding', 'programming', 'development', 'software', 'code', 'javascript', 'python', 'web', 'api'],
      'web': ['web', 'api', 'http', 'network', 'internet', 'browser', 'development', 'integration'],
      'security': ['security', 'encryption', 'privacy', 'protection', 'authentication', 'cybersecurity'],
      'automation': ['automation', 'workflow', 'integration', 'api', 'scripting', 'productivity'],
    };
    return categoryMappings[category] || [];
  };

  const filterItemsByCategory = (items: MarketplaceTemplate[]): MarketplaceTemplate[] => {
    if (activeCategory === 'all') return items;

    const categoryTags = getCategoryTags(activeCategory);
    return items.filter(item => {
      const itemTags = item.tags || [];
      const itemName = item.name.toLowerCase();
      const itemDescription = item.description?.toLowerCase() || '';

      return categoryTags.some(tag =>
        itemTags.some(itemTag => itemTag.toLowerCase().includes(tag)) ||
        itemName.includes(tag) ||
        itemDescription.includes(tag)
      );
    });
  };

  const filteredMarketplaceItems = filterItemsByCategory(allMarketplaceItems);

  // Phase 1 wiring: derive spotlight and available tags
  const curatedFeaturedIds = new Set<string>(CURATED_FEATURED_TEMPLATE_IDS);
  const spotlightItems = filteredMarketplaceItems.filter(
    (i) => i.is_kortix_team || curatedFeaturedIds.has(i.id)
  ).slice(0, 8);

  const availableTags = Array.from(
    new Set(filteredMarketplaceItems.flatMap(i => i.tags || []))
  ).slice(0, 24);

  return (
  <div className="space-y-8 flex flex-col min-h-full">
    {/* Lightning effect in header only (simulate hover) */}
    <div className="relative z-0">
      <UnicornLightning projectId="Gr1LmwbKSeJOXhpYEdit" simulateHover className="pointer-events-none absolute inset-0" />
      <div className="relative z-10">
        <DiscoverHeader
          value={marketplaceSearchQuery}
          onChange={setMarketplaceSearchQuery}
          onSubmit={() => { /* triggers useEffect pagination reset upstream */ }}
          nav={<TabsNavigation activeTab={'explore'} onTabChange={(tab) => { onTabChange?.(tab); }} />}
        />
      </div>
    </div>

    <FiltersBar
      sortBy={(marketplaceSortBy === 'most_downloaded' ? 'popular' : marketplaceSortBy) as any}
      onSortChange={(v) => setMarketplaceSortBy && setMarketplaceSortBy(v === 'popular' ? 'most_downloaded' : v)}
      selectedTags={marketplaceSelectedTags}
      onToggleTag={(tag) => {
        if (!setMarketplaceSelectedTags) return;
        const active = marketplaceSelectedTags.includes(tag);
        const next = active ? marketplaceSelectedTags.filter(t => t !== tag) : [...marketplaceSelectedTags, tag];
        setMarketplaceSelectedTags(next);
      }}
      availableTags={availableTags}
      segment={marketplaceFilter === 'kortix' ? 'kortix' : marketplaceFilter === 'community' ? 'community' : marketplaceFilter === 'mine' ? 'mine' : 'all'}
      onSegmentChange={(seg) => {
        const map: Record<string, 'all' | 'kortix' | 'community' | 'mine'> = { all: 'all', featured: 'all', kortix: 'kortix', community: 'community', mine: 'mine' };
        setMarketplaceFilter(map[seg]);
      }}
      viewMode={viewMode}
      onViewModeChange={(m) => setViewMode(m)}
    />

    {/* View toggle moved into FiltersBar so it sits after the 'mine' segment */}

    <div className="flex-1">
        {marketplaceLoading ? (
          <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col gap-4'}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={viewMode === 'grid' 
                ? "bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/40 shadow-sm p-4 space-y-3"
                : "bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm rounded-xl overflow-hidden border border-border/40 shadow-sm p-4 space-y-3"
              }>
                <div className="flex items-start justify-between">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-5 rounded w-3/4" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 rounded w-full" />
                  <Skeleton className="h-3 rounded w-2/3" />
                </div>
                <Skeleton className="h-8 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filteredMarketplaceItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mb-6">
              <Globe className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No agents found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {marketplaceSearchQuery 
                ? "No templates found matching your criteria. Try adjusting your search or filters."
                : "No agent templates are currently available in the marketplace."}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {spotlightItems.length > 0 && marketplaceFilter === 'all' && (
              <SpotlightRow items={spotlightItems} onPreview={handleAgentClick} onInstall={onInstallClick} />
            )}
            {marketplaceFilter === 'all' ? (
              <div className="space-y-6">
                {/* <MarketplaceSectionHeader
                  title="Popular Agents"
                  subtitle="Sorted by popularity - most downloads first"
                /> */}
                <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col gap-4'}>
                  {filteredMarketplaceItems.map((item) => (
                    <UnifiedAgentCard
                      key={item.id}
                      // Use compact variant for both grid and list so styling is consistent
                      variant={'compact'}
                      size={viewMode === 'grid' ? 'md' : 'sm'}
                      data={{
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        tags: item.tags,
                        created_at: item.created_at,
                        creator_id: item.creator_id,
                        creator_name: item.creator_name,
                        is_kortix_team: item.is_kortix_team,
                        download_count: item.download_count,
                        marketplace_published_at: item.marketplace_published_at,
                        icon_name: item.icon_name,
                        icon_color: item.icon_color,
                        icon_background: item.icon_background,
                      }}
                      state={{
                        isActioning: installingItemId === item.id,
                      }}
                      actions={{
                        onPrimaryAction: () => onInstallClick(item),
                        onDeleteAction: () => onDeleteTemplate(item),
                        onClick: () => handleAgentClick(item),
                      }}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col gap-4'}>
                {filteredMarketplaceItems.map((item) => (
                  <UnifiedAgentCard
                    key={item.id}
                    // Use compact variant for consistent list/grid styling
                    variant={'compact'}
                    size={viewMode === 'grid' ? 'md' : 'sm'}
                    data={{
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      tags: item.tags,
                      created_at: item.created_at,
                      creator_id: item.creator_id,
                      creator_name: item.creator_name,
                      is_kortix_team: item.is_kortix_team,
                      download_count: item.download_count,
                      marketplace_published_at: item.marketplace_published_at,
                      icon_name: item.icon_name,
                      icon_color: item.icon_color,
                      icon_background: item.icon_background,
                    }}
                    state={{
                      isActioning: installingItemId === item.id,
                    }}
                    actions={{
                      onPrimaryAction: () => onInstallClick(item),
                      onDeleteAction: () => onDeleteTemplate(item),
                      onClick: () => handleAgentClick(item),
                    }}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
            {marketplacePagination && (
              <Pagination
                currentPage={marketplacePagination.current_page}
                totalPages={marketplacePagination.total_pages}
                totalItems={marketplacePagination.total_items}
                pageSize={marketplacePagination.page_size}
                onPageChange={setMarketplacePage}
                onPageSizeChange={onMarketplacePageSizeChange}
                isLoading={marketplaceLoading}
                showPageSizeSelector={true}
                showJumpToPage={true}
                showResultsInfo={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};