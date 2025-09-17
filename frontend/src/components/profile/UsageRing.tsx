"use client";
import React, { useEffect, useState } from 'react';
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
  const targetPct = safeLimit ? Math.min(100, (safeCurrent / safeLimit) * 100) : 0;
  // Animated percentage state
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = pct;
    const delta = targetPct - start;
    if (Math.abs(delta) < 0.1) {
      setPct(targetPct);
      return;
    }
    const duration = 650; // ms
    const startTs = performance.now();
    let raf: number;
    const step = (ts: number) => {
      const progress = Math.min(1, (ts - startTs) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setPct(start + delta * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPct]);

  const dash = (pct / 100) * circumference;
  const stroke = pct >= 90 ? 'stroke-amber-500' : pct >= 70 ? 'stroke-indigo-500' : 'stroke-emerald-500';
  const label = safeLimit ? `${currencySymbol}${safeCurrent.toFixed(2)} / ${currencySymbol}${safeLimit.toFixed(2)}` : `${currencySymbol}${safeCurrent.toFixed(2)}`;
  const status = safeLimit ? `${pct.toFixed(1)}%` : 'No Limit';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="progressbar"
        aria-label="Usage consumption"
        aria-valuenow={Number(pct.toFixed(1))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={safeLimit ? `${pct.toFixed(1)}% of plan used` : `${label} used`}
      >
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
          {/* Subtle trailing aura for glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={12}
            fill="none"
            className={clsx('opacity-10 blur-[1px] origin-center -rotate-90', stroke)}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={10}
            fill="none"
            className={clsx('transition-[stroke-dasharray] duration-300 ease-out origin-center -rotate-90 drop-shadow-[0_0_4px_rgba(16,185,129,0.35)]', stroke)}
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
