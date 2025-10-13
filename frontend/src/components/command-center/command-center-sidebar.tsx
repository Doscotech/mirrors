'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  ArrowLeft,
  Bot,
  GraduationCap,
  Search,
  Gamepad2,
  Music,
  Code,
  Briefcase,
  Heart,
  Zap,
  Globe,
  Shield,
  Wrench,
} from 'lucide-react';
import { useCommandCenter } from '@/contexts/CommandCenterContext';

const categories = [
  { id: 'all', label: 'All Agents', icon: Bot },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'osint', label: 'OSINT', icon: Search },
  { id: 'entertainment', label: 'Entertainment', icon: Music },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'productivity', label: 'Productivity', icon: Briefcase },
  { id: 'creative', label: 'Creative', icon: Heart },
  { id: 'utilities', label: 'Utilities', icon: Wrench },
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'web', label: 'Web & API', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'automation', label: 'Automation', icon: Zap },
];

export function CommandCenterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeCategory, setActiveCategory, setCommandCenterMode } = useCommandCenter();

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Navigate to marketplace if not already there
    if (!pathname.includes('/marketplace')) {
      router.push('/marketplace');
    }
  };

  const handleBackToMain = () => {
    setCommandCenterMode(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Command Center</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-2">
          <SidebarMenu>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton
                    onClick={() => handleCategorySelect(category.id)}
                    isActive={isActive}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleBackToMain}
          className="w-full justify-start gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}