"use client";
import React from 'react';
import MobileSidebarToggle from '@/components/layout/MobileSidebarToggle';
import clsx from 'clsx';

interface StandardHeroSearchProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

interface StandardHeroProps {
  title: string;
  subtitle?: string;
  nav?: React.ReactNode;
  right?: React.ReactNode; // e.g. usage ring
  /** Optional inline search input (marketplace style) */
  search?: StandardHeroSearchProps;
  /** Extra content stacked under subtitle on the left (e.g. metadata rows) */
  leftExtra?: React.ReactNode;
  className?: string;
}

/**
 * StandardHero
 * Unifies the gradient / glass / pattern hero design used on the Agent Marketplace
 * and exposes a generic API so other pages (Profile, etc.) can adopt the exact look.
 */
export const StandardHero: React.FC<StandardHeroProps> = ({
  title,
  subtitle,
  nav,
  right,
  search,
  leftExtra,
  className
}) => {
  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-white via-background to-background dark:from-[#0b1220] dark:via-background dark:to-background",
      className
    )}>
      {/* Glow gradients */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-60"
        style={{
          background: [
            "radial-gradient(600px 280px at 8% 0%, rgba(6,182,212,0.10), transparent 60%)",
            "radial-gradient(520px 240px at 92% 8%, rgba(139,92,246,0.08), transparent 60%)",
            "radial-gradient(420px 180px at 50% 100%, rgba(244,63,94,0.06), transparent 60%)"
          ].join(',')
        }}
      />
      {/* Light mode concentric accent rings */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] dark:hidden"
        style={{
          backgroundImage: [
            "repeating-radial-gradient(circle at 15% -10%, rgba(6,182,212,0.20) 0px, rgba(6,182,212,0.20) 1px, transparent 2px, transparent 24px)",
            "repeating-radial-gradient(circle at 85% 0%, rgba(139,92,246,0.16) 0px, rgba(139,92,246,0.16) 1px, transparent 2px, transparent 22px)"
          ].join(',')
        }}
      />
      {/* Dark mode soft dot rings */}
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.14]" 
        style={{
          backgroundImage: [
            "repeating-radial-gradient(circle at 15% -10%, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 2px, transparent 26px)",
            "repeating-radial-gradient(circle at 85% 0%, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 2px, transparent 22px)"
          ].join(',')
        }}
      />
      {/* Edge feather gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "linear-gradient(180deg, rgba(6,182,212,0.06), transparent 22%, transparent 78%, rgba(244,63,94,0.06))",
            "linear-gradient(90deg, rgba(6,182,212,0.05), transparent 18%, transparent 82%, rgba(139,92,246,0.05))"
          ].join(',')
        }}
      />
      <div className="relative p-6 md:p-8">
        {/* Mobile sidebar toggle (dashboard context) */}
        <div className="absolute top-3 left-3 md:hidden z-10">
          <MobileSidebarToggle />
        </div>
        {nav && <div className="mb-3 -mt-1">{nav}</div>}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground max-w-xl leading-relaxed">{subtitle}</p>}
            {leftExtra && <div className="mt-4 space-y-3 text-[11px] text-muted-foreground/80">{leftExtra}</div>}
          </div>
          <div className={clsx("w-full md:w-[420px] flex flex-col gap-4", (!search && !right) && "md:w-auto")}> 
            {search && (
              <div>
                <label className="sr-only" htmlFor="standard-hero-search">Search</label>
                <div className="flex items-center gap-2 rounded-xl border bg-white/80 dark:bg-background/70 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-background">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-muted-foreground"><path fill="currentColor" d="M21.53 20.47L18.37 17.3A8.42 8.42 0 0 0 19 13.5A8.5 8.5 0 1 0 10.5 22a8.42 8.42 0 0 0 3.8-.96l3.17 3.16a.75.75 0 1 0 1.06-1.06M4 13.5A6.5 6.5 0 1 1 10.5 20A6.51 6.51 0 0 1 4 13.5"/></svg>
                  <input
                    id="standard-hero-search"
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search.onSubmit?.()}
                    placeholder={search.placeholder || 'Search'}
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                  />
                </div>
              </div>
            )}
            {right && (
              <div className={clsx(search && "md:self-end")}>{right}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardHero;
