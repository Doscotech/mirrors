'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Brain, Gamepad2, Search, Zap, BookOpen, Globe, Music, Camera, Code, Briefcase, Heart, Sparkles } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface CommandCenterSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSwitchToMain?: () => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const agentCategories = [
  {
    id: 'all',
    label: 'All Agents',
    icon: Bot,
    description: 'Browse all available agents',
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: BookOpen,
    description: 'Research and educational agents',
  },
  {
    id: 'osint',
    label: 'OSINT',
    icon: Search,
    description: 'Open source intelligence tools',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Music,
    description: 'Fun and creative agents',
  },
  {
    id: 'games',
    label: 'Games',
    icon: Gamepad2,
    description: 'Gaming and interactive agents',
  },
  {
    id: 'productivity',
    label: 'Productivity',
    icon: Briefcase,
    description: 'Work and task management',
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: Sparkles,
    description: 'Art, design, and content creation',
  },
  {
    id: 'technical',
    label: 'Technical',
    icon: Code,
    description: 'Programming and development',
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: Brain,
    description: 'Data analysis and insights',
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Zap,
    description: 'Workflow and process automation',
  },
  {
    id: 'social',
    label: 'Social',
    icon: Heart,
    description: 'Social media and communication',
  },
  {
    id: 'media',
    label: 'Media',
    icon: Camera,
    description: 'Image, video, and multimedia',
  },
];

export function CommandCenterSidebar({
  onSwitchToMain,
  activeCategory = 'all',
  onCategoryChange,
  ...props
}: CommandCenterSidebarProps) {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] shadow-sm"
      {...props}
    >
      <SidebarHeader className="px-3 py-4 border-b border-border/40">
        <div className="flex h-[44px] items-center px-2 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchToMain}
            className="flex items-center gap-2 hover:bg-accent/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {state !== 'collapsed' && <span className="text-sm">Back to Main</span>}
          </Button>

          {state !== 'collapsed' && (
            <div className="ml-auto flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8 hover:bg-accent/50 rounded-lg transition-colors" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-2 py-3">
        <div className="space-y-4">
          {/* Header */}
          <div className="px-2">
            <h2 className={cn(
              "font-semibold text-primary mb-1",
              state === 'collapsed' ? 'text-center' : 'text-left'
            )}>
              {state === 'collapsed' ? 'CC' : 'Command Center'}
            </h2>
            {state !== 'collapsed' && (
              <p className="text-xs text-muted-foreground">Explore agent categories</p>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-1">
            {agentCategories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange?.(category.id)}
                  className={cn(
                    'w-full text-left rounded-xl transition-all duration-200 group relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold shadow-sm border border-primary/20'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground font-medium'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                  )}
                  <div className="flex items-center px-3 py-2 relative z-10">
                    <Icon className={cn(
                      "h-4 w-4 mr-3 flex-shrink-0 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    {state !== 'collapsed' && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{category.label}</div>
                        <div className="text-xs text-muted-foreground/70 truncate">{category.description}</div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}