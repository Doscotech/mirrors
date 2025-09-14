"use client";
import React from 'react';
import clsx from 'clsx';

interface UsageRingProps {
  current: number | null | undefined;
  limit: number | null | undefined;
  currencySymbol?: string;
  size?: number;
}

export function UsageRing({ current, limit, currencySymbol = '$', size = 144 }: UsageRingProps) {
  const radius = (size / 2) - 14; // padding for stroke width
  const circumference = 2 * Math.PI * radius;
  const safeCurrent = typeof current === 'number' ? current : 0;
  const safeLimit = typeof limit === 'number' && limit > 0 ? limit : null;
  const pct = safeLimit ? Math.min(100, (safeCurrent / safeLimit) * 100) : 0;
  const dash = (pct / 100) * circumference;
  const stroke = pct >= 90 ? 'stroke-amber-500' : pct >= 70 ? 'stroke-indigo-500' : 'stroke-emerald-500';
  const label = safeLimit ? `${currencySymbol}${safeCurrent.toFixed(2)} / ${currencySymbol}${safeLimit.toFixed(2)}` : `${currencySymbol}${safeCurrent.toFixed(2)}`;
  const status = safeLimit ? `${pct.toFixed(1)}%` : 'No Limit';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }} aria-label="Usage consumption" role="img">
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <linearGradient id="usageRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gradient-start, rgb(99,102,241))" />
              <stop offset="100%" stopColor="var(--gradient-end, rgb(16,185,129))" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-muted/30 dark:stroke-muted/20"
            strokeWidth={10}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={10}
            fill="none"
            className={clsx('transition-all duration-700 ease-out origin-center -rotate-90', stroke)}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="text-xs font-medium text-muted-foreground/70 mb-0.5">Usage</div>
          <div className="text-sm font-semibold tabular-nums">{status}</div>
          <div className="mt-1 text-[10px] text-muted-foreground/60 px-2 leading-snug">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default UsageRing;
