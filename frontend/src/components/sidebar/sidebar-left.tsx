'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, LayoutDashboard, FolderKanban, UserCircle2, Bot, Sparkles, Menu } from 'lucide-react';

// NavAgents (thread history) removed per request to hide message/task history from sidebar
// import { NavAgents } from '@/components/sidebar/nav-agents';
import { NavUserWithTeams } from '@/components/sidebar/nav-user-with-teams';
// Removed Enterprise CTA per request
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
// Removed collapsible Agents dropdown
import { NewAgentDialog } from '@/components/agents/new-agent-dialog';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useDocumentModalStore } from '@/lib/stores/use-document-modal-store';
// Floating mobile menu button component
function FloatingMobileMenuButton() {
  const { setOpenMobile, openMobile } = useSidebar();
  const isMobile = useIsMobile();


  return null;
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: 'Loading...',
    email: 'loading@example.com',
    avatar: '',
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showNewAgentDialog, setShowNewAgentDialog] = useState(false);
  const { isOpen: isDocumentModalOpen } = useDocumentModalStore();

  // Close mobile menu on page navigation
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, searchParams, isMobile, setOpenMobile]);

  
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser({
          name:
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0] ||
            'User',
          email: data.user.email || '',
          avatar: data.user.user_metadata?.avatar_url || '',
        });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle sidebar shortcuts when document modal is open
      console.log('Sidebar-left handler - document modal open:', isDocumentModalOpen, 'key:', event.key);
      if (isDocumentModalOpen) return;
      
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setOpen(!state.startsWith('expanded'));
        window.dispatchEvent(
          new CustomEvent('sidebar-left-toggled', {
            detail: { expanded: !state.startsWith('expanded') },
          }),
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, setOpen, isDocumentModalOpen]);




  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 bg-background/95 backdrop-blur-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      {...props}
    >
      <SidebarHeader className="px-2 py-2">
        <div className="flex h-[40px] items-center px-1 relative">
          <Link href="/dashboard" className="flex-shrink-0" onClick={() => isMobile && setOpenMobile(false)}>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Xera</span>
          </Link>
          {state !== 'collapsed' && (
            <div className="ml-2 transition-all duration-200 ease-in-out whitespace-nowrap">
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {state !== 'collapsed' && !isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="h-8 w-8" />
                </TooltipTrigger>
                <TooltipContent>Toggle sidebar (CMD+B)</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <SidebarGroup>
          <SidebarMenu>
            {[
              {
                href: '/dashboard',
                label: 'New Task',
                icon: Plus,
                match: (p: string) => p === '/dashboard',
                onClick: () => posthog.capture('new_task_clicked'),
              },
              {
                href: '/overview',
                label: 'Overview',
                icon: LayoutDashboard,
                match: (p: string) => p === '/overview',
              },
              {
                href: '/projects',
                label: 'Projects',
                icon: FolderKanban,
                match: (p: string) => p.startsWith('/projects'),
              },
              {
                href: '/agents?tab=marketplace',
                label: 'Command Center',
                icon: Bot,
                match: (p: string) => p.startsWith('/agents'),
              },
              {
                href: '/profile',
                label: 'Profile',
                icon: UserCircle2,
                match: (p: string) => p.startsWith('/profile'),
              },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <SidebarMenuButton
                  className={cn('touch-manipulation mt-1 first:mt-0', {
                    'bg-accent text-accent-foreground font-medium': item.match(pathname),
                  })}
                  onClick={() => {
                    item.onClick?.();
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span className="flex items-center justify-between w-full">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            ))}
          </SidebarMenu>
        </SidebarGroup>
  {/* Thread / message history removed */}
      </SidebarContent>
  {/* Enterprise demo CTA removed per request */}
      <SidebarFooter>
        {state === 'collapsed' && (
          <div className="mt-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="h-8 w-8" />
              </TooltipTrigger>
              <TooltipContent>Expand sidebar (CMD+B)</TooltipContent>
            </Tooltip>
          </div>
        )}
        <NavUserWithTeams user={user} />
      </SidebarFooter>
      <SidebarRail />
      <NewAgentDialog 
        open={showNewAgentDialog} 
        onOpenChange={setShowNewAgentDialog}
      />
    </Sidebar>
  );
}

// Export the floating button so it can be used in the layout
export { FloatingMobileMenuButton };
