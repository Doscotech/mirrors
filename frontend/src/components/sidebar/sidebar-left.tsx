'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, LayoutDashboard, FolderKanban, UserCircle2, Bot, Calendar } from 'lucide-react';

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

function FloatingMobileMenuButton() {
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
    isAdmin?: boolean;
  }>({
    name: 'Loading...',
    email: 'loading@example.com',
    avatar: '',
    isAdmin: false,
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showNewAgentDialog, setShowNewAgentDialog] = useState(false);
  const { isOpen: isDocumentModalOpen } = useDocumentModalStore();

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
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .in('role', ['admin', 'super_admin']);
        const isAdmin = roleData && roleData.length > 0;

        setUser({
          name:
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0] ||
            'User',
          email: data.user.email || '',
          avatar: data.user.user_metadata?.avatar_url || '', // User avatar (different from agent avatar)
          isAdmin: isAdmin,
        });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
      className="border-r border-border/40 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] shadow-sm"
      {...props}
    >
      <SidebarHeader className="px-3 py-4 border-b border-border/40">
        <div className="flex h-[44px] items-center px-2 relative">
          <Link href="/dashboard" className="flex-shrink-0 group" onClick={() => isMobile && setOpenMobile(false)}>
            <div className="flex items-center gap-2">
              {state !== 'collapsed' ? (
                <span className="text-3xl" style={{ fontFamily: 'var(--font-xera-accent)', fontStyle: 'italic', color: 'hsl(var(--primary))', lineHeight: 1 }}>Xera</span>
              ) : (
                <span className="text-2xl" style={{ fontFamily: 'var(--font-xera-accent)', fontStyle: 'italic', color: 'hsl(var(--primary))', lineHeight: 1 }}>X</span>
              )}
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {state !== 'collapsed' && !isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="h-8 w-8 hover:bg-accent/50 rounded-lg transition-colors" />
                </TooltipTrigger>
                <TooltipContent>Toggle sidebar (CMD+B)</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-2 py-3">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
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
                href: '/agents?tab=explore',
                label: 'Command Center',
                icon: Bot,
                match: (p: string) => p.startsWith('/agents'),
              },
              {
                href: '/settings/account',
                label: 'Profile',
                icon: UserCircle2,
                match: (p: string) => p.startsWith('/settings/account'),
              },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <SidebarMenuButton
                  className={cn(
                    'touch-manipulation rounded-xl transition-all duration-200 group relative overflow-hidden',
                    item.match(pathname)
                      ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold shadow-sm border border-primary/20'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground font-medium'
                  )}
                  onClick={() => {
                    item.onClick?.();
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  {item.match(pathname) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                  )}
                  <item.icon className={cn(
                    "h-4 w-4 mr-3 relative z-10 transition-transform duration-200",
                    item.match(pathname) ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className="flex items-center justify-between w-full relative z-10">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            ))}
          </SidebarMenu>
        </SidebarGroup>
  {/* Thread / message history removed */}
      </SidebarContent>
  {/* Enterprise demo CTA removed per request */}
      <SidebarFooter className="border-t border-border/40 px-2 py-3">
        {state === 'collapsed' && (
          <div className="mb-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="h-8 w-8 hover:bg-accent/50 rounded-lg transition-colors" />
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
