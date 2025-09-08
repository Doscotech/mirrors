"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  GalleryVerticalEnd,
} from "lucide-react"

import { TeamSwitcher } from "@/components/team-switcher"
import { NavUser } from "@/components/nav-user"
import { DocsThemeToggle } from "@/components/ui/docs-theme-toggle"
import { Badge } from "@/components/ui/badge"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./home/theme-toggle"

const data = {
  user: {
    name: "Xera User",
    email: "support@xera.ai",
    avatar: "/favicon.png",
  },
  teams: [
    {
      name: "Xera",
      logo: GalleryVerticalEnd,
      plan: "Cloud",
    },
  ],
  navMain: [
    {
      title: "Getting Started",
      items: [
        {
          title: "What is Xera?",
          url: "/docs/introduction",
        },
        {
          title: "Quick Start",
          url: "/docs/quick-start",
        },
        {
          title: "How Xera Works",
          url: "/docs/how-xera-works",
        },
        {
          title: "System Deep Dive",
          url: "/docs/self-hosting",
        },
        {
          title: "Agent Examples",
          url: "/docs/agent-examples",
          comingSoon: true,
        },
      ],
    },
    {
      title: "Core Concepts",
      items: [
        {
          title: "Integrations",
          url: "/docs/integrations",
        },
        {
          title: "Knowledge Base",
          url: "/docs/knowledge-base",
        },
        {
          title: "Triggers",
          url: "/docs/triggers",
        },
        {
          title: "Instructions",
          url: "/docs/instructions",
        },
        {
          title: "Playbooks",
          url: "/docs/playbooks",
        },
      ],
    },
    {
      title: "Reference",
      items: [
        {
          title: "API",
          url: "/docs/api",
          comingSoon: true,
        },
        {
          title: "Limits",
          url: "/docs/limits",
          comingSoon: true,
        },
        {
          title: "Billing",
          url: "/docs/billing",
          comingSoon: true,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  

  const isActive = (url: string) => {
    return pathname === url
  }

  return (
    <Sidebar className="w-72 [&_[data-sidebar=sidebar]]:bg-white dark:[&_[data-sidebar=sidebar]]:bg-black border-none" {...props}>
      <SidebarHeader className="bg-transparent p-6 px-2">
        <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Xera</span>
      </SidebarHeader>
      <SidebarContent className="px-2 bg-transparent scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {data.navMain.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="font-medium tracking-wide">{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      className={`font-semibold ${item.comingSoon ? 'opacity-70 cursor-not-allowed' : ''}`}
                      asChild={!item.comingSoon}
                      isActive={isActive(item.url)}
                      disabled={item.comingSoon}
                    >
                      {item.comingSoon ? (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          <Badge className="ml-auto text-xs bg-amber-500/20 border-amber-500/60 text-white text-amber-500">
                            Coming Soon
                          </Badge>
                        </div>
                      ) : (
                        <Link href={item.url} className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="bg-transparent p-4 flex flex-row justify-between items-center">
        <div className="text-muted-foreground text-xs">Version 0.1.0</div>
        <ThemeToggle/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

