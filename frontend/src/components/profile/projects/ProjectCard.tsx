"use client";
import React from 'react';
import clsx from 'clsx';
import { profileColorSchemes, ProfileColorSchemeKey, clampProgress } from '../tokens';

export interface ProjectCardProps {
  id: string;
  title: string;
  stage?: string;
  date?: string; // ISO
  progress?: number; // 0..1
  status?: 'active' | 'pending' | 'blocked' | 'complete';
  contributors?: { id: string; initials: string; avatarUrl?: string | null }[];
  daysRemaining?: number;
  colorScheme?: ProfileColorSchemeKey;
}

export function ProjectCard({ title, stage, date, progress = 0, status = 'active', contributors = [], daysRemaining, colorScheme = 'blue' }: ProjectCardProps) {
  const scheme = profileColorSchemes[colorScheme];
  const pct = Math.round(clampProgress(progress) * 100);
  return (
    <div className={clsx('relative rounded-lg border p-3 flex flex-col gap-2 overflow-hidden', scheme.bg, scheme.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-muted-foreground/70 leading-none mb-1 truncate">{date ? new Date(date).toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric'}) : '—'}</div>
          <h3 className={clsx('text-xs font-semibold tracking-tight truncate', scheme.text)}>{title}</h3>
          {stage && <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{stage}</p>}
        </div>
        <button className="h-6 w-6 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[10px]" aria-label="Project menu">•••</button>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', scheme.accentBar)} style={{ width: pct + '%' }} />
      </div>
      <div className="flex items-center justify-between text-[10px] mt-1.5">
        <div className="flex items-center gap-1">
          <StatusDot status={status} />
          <span className="text-muted-foreground/70">{pct}%</span>
        </div>
        {typeof daysRemaining === 'number' && <span className="text-muted-foreground/60">{daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Left</span>}
      </div>
      {contributors.length > 0 && (
        <div className="flex mt-1.5 -space-x-2">
          {contributors.slice(0,5).map(c => (
            <div key={c.id} className="w-6 h-6 rounded-full border border-white/40 dark:border-white/10 bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center text-[10px] font-medium text-muted-foreground overflow-hidden">
              {c.avatarUrl ? <img src={c.avatarUrl} alt={c.initials} className="w-full h-full object-cover" /> : c.initials }
            </div>
          ))}
          {contributors.length > 5 && <span className="ml-2 text-[10px] text-muted-foreground/60">+{contributors.length - 5}</span>}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: NonNullable<ProjectCardProps['status']> }) {
  const map: Record<string,string> = {
    active: 'bg-emerald-500',
    pending: 'bg-amber-500',
    blocked: 'bg-rose-500',
    complete: 'bg-sky-500'
  };
  return <span className={clsx('inline-block w-2 h-2 rounded-full', map[status])} aria-label={status} />;
}

export default ProjectCard;
