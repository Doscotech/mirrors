"use client";
import React from 'react';
import { clampProgress } from '../tokens';

export interface ProgressBadgeProps {
  value: number; // 0..1
  label?: string;
  showPercent?: boolean;
}

export function ProgressBadge({ value, label, showPercent = true }: ProgressBadgeProps) {
  const pct = Math.round(clampProgress(value) * 100);
  const variant = pct >= 90 ? 'warning' : pct >= 70 ? 'info' : 'success';
  const colorMap: Record<string,string> = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
    info: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
  };
  return (
    <span className={['inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium', colorMap[variant]].join(' ')}>
      {label && <span>{label}</span>}
      {showPercent && <span className="tabular-nums">{pct}%</span>}
    </span>
  );
}

export default ProgressBadge;
