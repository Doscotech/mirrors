'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Ripple } from '@/components/ui/ripple';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, children, className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[32px] border border-border/60 bg-card/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl',
        className
      )}
    >
      <Ripple className="opacity-60" />
      <div className="relative flex flex-col items-center gap-6 px-6 py-10 text-center md:px-10 md:py-14">
        <div className="inline-flex items-center justify-center rounded-2xl border border-border/50 bg-background/60 p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur">
          <Icon className="h-6 w-6 text-primary md:h-7 md:w-7" />
        </div>
        <div className="mx-auto max-w-3xl space-y-4 text-balance text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}; 