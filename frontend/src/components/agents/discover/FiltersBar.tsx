"use client";
import React from 'react';

type SortKey = 'popular' | 'newest' | 'name';

interface FiltersBarProps {
  sortBy: SortKey;
  onSortChange: (v: SortKey) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  availableTags: string[];
  segment: 'all' | 'featured' | 'kortix' | 'community' | 'mine';
  onSegmentChange: (seg: FiltersBarProps['segment']) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({ sortBy, onSortChange, selectedTags, onToggleTag, availableTags, segment, onSegmentChange }) => {
  return (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center gap-1.5">
        {(['all','featured','kortix','community','mine'] as const).map(seg => (
          <button
            key={seg}
            onClick={() => onSegmentChange(seg)}
      className={`rounded-full px-3 py-1.5 text-sm border transition ${segment === seg ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background/70 text-muted-foreground border-border/60 hover:text-foreground'}`}
          >{seg === 'kortix' ? 'Verified' : seg.charAt(0).toUpperCase() + seg.slice(1)}</button>
        ))}
    <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
      className="rounded-lg border bg-background px-3 py-1.5 text-sm"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      {availableTags.length > 0 && (
    <div className="flex flex-wrap gap-1.5">
          {availableTags.map(tag => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
        className={`rounded-full px-2.5 py-1 text-xs border ${active ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background/70 text-muted-foreground border-border/60 hover:text-foreground'}`}
              >{tag}</button>
            );
          })}
        </div>
      )}
    </div>
  );
};
