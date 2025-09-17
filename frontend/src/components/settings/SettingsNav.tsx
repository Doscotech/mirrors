"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Cog, CreditCard, KeyRound, Shield, Wrench, Palette } from 'lucide-react';

type IconName = 'Cog' | 'CreditCard' | 'KeyRound' | 'Shield' | 'Wrench' | 'Palette';
interface SettingsNavItem { label: string; href: string; icon?: IconName; }

const ICONS: Record<IconName, React.ComponentType<{ className?: string }>> = {
  Cog, CreditCard, KeyRound, Shield, Wrench, Palette
};

export function SettingsNav({ items }: { items: readonly SettingsNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map(item => {
        const active = pathname === item.href;
  const Icon = item.icon ? ICONS[item.icon] : undefined;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors border',
              active
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-transparent text-muted-foreground hover:text-accent-foreground hover:bg-accent/50 border-transparent'
            )}
          >
            {Icon && <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
