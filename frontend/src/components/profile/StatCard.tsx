"use client";
import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value?: React.ReactNode;
  hint?: string;
  loading?: boolean;
  accent?: 'primary' | 'warning' | 'success' | 'neutral';
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'from-indigo-500/25 to-indigo-500/5 text-indigo-600 dark:text-indigo-300',
  warning: 'from-amber-500/25 to-amber-500/5 text-amber-600 dark:text-amber-300',
  success: 'from-emerald-500/25 to-emerald-500/5 text-emerald-600 dark:text-emerald-300',
  neutral: 'from-slate-500/25 to-slate-500/5 text-slate-600 dark:text-slate-300'
};

export function StatCard({ label, value, hint, loading, accent = 'neutral' }: StatCardProps) {
  return (
    <div className="group relative rounded-lg border border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl px-4 py-3 overflow-hidden">
      <div className={clsx('absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br', accentMap[accent])} />
      <div className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground/90 mb-1">{label}</div>
      <div className="text-lg font-semibold tabular-nums">
        {loading ? <span className="animate-pulse text-muted-foreground">…</span> : value ?? '—'}
      </div>
      {hint && <div className="mt-1 text-[11px] leading-snug text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

export default StatCard;
