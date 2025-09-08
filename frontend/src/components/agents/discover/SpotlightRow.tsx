"use client";
import React from 'react';
import type { MarketplaceTemplate } from '@/components/agents/installation/types';
import { AgentCardV2 } from './AgentCardV2';

interface SpotlightRowProps {
  items: MarketplaceTemplate[];
  onPreview: (item: MarketplaceTemplate) => void;
  onInstall: (item: MarketplaceTemplate, e?: React.MouseEvent) => void;
  title?: string;
  subtitle?: string;
}

export const SpotlightRow: React.FC<SpotlightRowProps> = ({ items, onPreview, onInstall, title = 'Featured by Xpathedge', subtitle = 'Handpicked for quality and capability' }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {items.map((item) => (
          <AgentCardV2 key={item.id} item={item} onPreview={onPreview} onInstall={onInstall} />
        ))}
      </div>
    </div>
  );
};
