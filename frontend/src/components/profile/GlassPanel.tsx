"use client";
import React from 'react';
import clsx from 'clsx';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  noPadding?: boolean;
}

export function GlassPanel({ children, className, noPadding, ...rest }: GlassPanelProps) {
  return (
    <div
      className={clsx(
        'relative rounded-xl border border-white/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12),0_2px_4px_-2px_rgba(0,0,0,0.08)]',
        'before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/40 before:to-white/5 dark:before:from-white/[0.08] dark:before:to-white/[0.02] before:pointer-events-none',
        'after:absolute after:inset-px after:rounded-[inherit] after:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_60%)] dark:after:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)] after:opacity-60 after:pointer-events-none',
        !noPadding && 'p-5 md:p-6',
        'transition-colors',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default GlassPanel;
