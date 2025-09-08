"use client";
import React from 'react';
import type { MarketplaceTemplate } from '@/components/agents/installation/types';
import { Brain, Image as ImageIcon, Zap, ChevronRight } from 'lucide-react';

interface AgentCardV2Props {
  item: MarketplaceTemplate;
  onPreview?: (item: MarketplaceTemplate) => void;
  onInstall: (item: MarketplaceTemplate, e?: React.MouseEvent) => void;
}

export const AgentCardV2: React.FC<AgentCardV2Props> = ({ item, onPreview, onInstall }) => {

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return; // don't trigger on button clicks
    onPreview?.(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPreview?.(item);
    }
  };

  const tagText = (item.tags || []).map(t => t.toLowerCase());
  const hasImage = tagText.some(t => /(image|vision|photo|design)/.test(t));
  const hasAction = tagText.some(t => /(automation|speed|fast|action|execute|tools)/.test(t));
  const hasReason = tagText.some(t => /(reason|plan|analysis|agent|brain|code)/.test(t));
  const iconSet = [
    hasImage && <ImageIcon key="img" className="h-4 w-4" />,
    hasAction && <Zap key="zap" className="h-4 w-4" />,
    hasReason && <Brain key="brain" className="h-4 w-4" />,
  ].filter(Boolean) as JSX.Element[];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
  onKeyDown={handleKeyDown}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 hover:bg-card transition-colors shadow-sm hover:shadow-md focus:outline-none"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-base ring-1 ring-border">
            {item.avatar || '🤖'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-[15px] leading-5">{item.name}</h3>
              {item.is_kortix_team && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/30">Verified</span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">{item.creator_name || 'Unknown'}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {item.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground/90 min-h-[40px]">{item.description}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            {iconSet.length > 0 ? iconSet : (
              <>
                <ImageIcon className="h-4 w-4" />
                <Zap className="h-4 w-4" />
                <Brain className="h-4 w-4" />
              </>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onPreview?.(item)}
              className="rounded-lg border px-2.5 py-1 text-xs hover:bg-accent"
            >
              Preview
            </button>
            <button
              onClick={(e) => onInstall(item, e)}
              className="rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-foreground hover:brightness-95"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
