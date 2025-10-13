"use client";
import React from 'react';
import clsx from 'clsx';

interface DiscoverHeaderProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  nav?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
  subtitle?: string;
  placeholder?: string;
}

export const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
  value,
  onChange,
  onSubmit,
  nav,
  right,
  title = 'Discover Agents',
  subtitle = 'Browse curated agents and templates from the team and by the community.',
  placeholder = 'Search agents, tools, or tags'
}) => {
  return (
    <div>
      {nav && <div className="mb-3 -mt-1">{nav}</div>}
      <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={clsx("w-full md:w-[420px] flex items-center gap-3", !value && 'md:w-auto')}>
            <label className="sr-only" htmlFor="discover-search">Search</label>
            <div className="flex items-center gap-2 rounded-xl border bg-white/80 dark:bg-background/70 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-background">
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-muted-foreground"><path fill="currentColor" d="M21.53 20.47L18.37 17.3A8.42 8.42 0 0 0 19 13.5A8.5 8.5 0 1 0 10.5 22a8.42 8.42 0 0 0 3.8-.96l3.17 3.16a.75.75 0 1 0 1.06-1.06M4 13.5A6.5 6.5 0 1 1 10.5 20A6.51 6.51 0 0 1 4 13.5"/></svg>
              <input
                id="discover-search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
                placeholder={placeholder || 'Search'}
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
              />
            </div>
          </div>

          {right && (
            <div className="flex items-center">{right}</div>
          )}
        </div>
      </div>
    </div>
  );
};
