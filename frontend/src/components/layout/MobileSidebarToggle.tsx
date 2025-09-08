"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function MobileSidebarToggle({ className }: { className?: string }) {
  const { setOpenMobile } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Open menu"
      onClick={() => setOpenMobile(true)}
      className={cn(
        "md:hidden h-9 w-9 rounded-xl bg-background/70 backdrop-blur-sm border border-border text-foreground shadow-sm hover:bg-accent/60",
        className
      )}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

export default MobileSidebarToggle;
