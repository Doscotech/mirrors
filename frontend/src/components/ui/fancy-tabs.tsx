'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export interface TabConfig {
  value: string;
  icon: LucideIcon;
  label: string;
  shortLabel?: string;
}

interface FancyTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

interface TabButtonProps {
  value: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton = ({ value, isActive, onClick, children }: TabButtonProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-out",
        !isActive && (isDark ? "hover:bg-white/5" : "hover:bg-muted/50"),
        isActive
          ? isDark
            ? "text-white bg-white/10 border border-white/15 shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
            : "text-foreground bg-background border border-border/50"
          : isDark
            ? "text-white/70 hover:text-white"
            : "text-muted-foreground hover:text-foreground"
      )}
      style={isActive && isDark ? {
        backdropFilter: 'blur(12px)'
      } : undefined}
    >
      {isActive && isDark && (
        <div 
          className="absolute inset-0 rounded-xl opacity-30 blur-[2px]"
          style={{
            background: 'linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
            zIndex: -1
          }}
        />
      )}
      {children}
    </button>
  );
};

export const FancyTabs = ({ tabs, activeTab, onTabChange, className }: FancyTabsProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div 
      className={cn(
        "overflow-hidden inline-grid rounded-2xl p-1 border",
        isDark ? "border-white/10 bg-white/5" : "border-border/50 bg-muted/60",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        ...(isDark ? {
          backdropFilter: 'blur(16px)'
        } : {})
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <TabButton 
            key={tab.value}
            value={tab.value} 
            isActive={activeTab === tab.value}
            onClick={() => onTabChange(tab.value)}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.shortLabel && (
              <span className="sm:hidden">{tab.shortLabel}</span>
            )}
          </TabButton>
        );
      })}
    </div>
  );
}; 