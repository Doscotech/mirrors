"use client";

import React from 'react';
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
  onTabChange
}: MarketplaceTabProps) => {
  const router = useRouter();
  const handleAgentClick = (item: MarketplaceTemplate) => {
    // Use the dedicated preview page
    router.push(`/agents/preview/${item.id}`);
  };

  // Phase 1 wiring: derive spotlight and available tags
  const curatedFeaturedIds = new Set<string>(CURATED_FEATURED_TEMPLATE_IDS);
  const spotlightItems = allMarketplaceItems.filter(
    (i) => i.is_kortix_team || curatedFeaturedIds.has(i.id)
  ).slice(0, 8);

  const availableTags = Array.from(
    new Set(allMarketplaceItems.flatMap(i => i.tags || []))
  ).slice(0, 24);

  return (
  <div className="space-y-5 flex flex-col min-h-full">
      <DiscoverHeader
        value={marketplaceSearchQuery}
        onChange={setMarketplaceSearchQuery}
        onSubmit={() => { /* triggers useEffect pagination reset upstream */ }}
  nav={<TabsNavigation activeTab={'marketplace'} onTabChange={(tab) => { onTabChange?.(tab); }} />}
      />

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
      />

      <div className="flex-1">
        {marketplaceLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="h-48" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-5 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 rounded" />
                    <Skeleton className="h-4 rounded w-3/4" />
                  </div>
                  <Skeleton className="h-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : allMarketplaceItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
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
              <div className="space-y-5">
                {/* <MarketplaceSectionHeader
                  title="Popular Agents"
                  subtitle="Sorted by popularity - most downloads first"
                /> */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {allMarketplaceItems.map((item) => (
                    <UnifiedAgentCard
                      key={item.id}
                      variant="marketplace"
                      data={{
                        id: item.id,
                        name: item.name,
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {allMarketplaceItems.map((item) => (
                  <UnifiedAgentCard
                    key={item.id}
                    variant="marketplace"
                    data={{
                      id: item.id,
                      name: item.name,
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