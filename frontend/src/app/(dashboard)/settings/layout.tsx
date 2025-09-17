import React from 'react';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { Separator } from '@/components/ui/separator';
import { Cog, CreditCard, KeyRound, Shield, Wrench, Palette } from 'lucide-react';
// NOTE: Avoid passing component references (functions) from this Server Component to the client Nav.
// We send string identifiers and map them to Lucide icons within the client component to satisfy RSC serialization.

export default function UnifiedSettingsLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { label: 'Account', href: '/settings/account', icon: 'Cog' },
    { label: 'Billing', href: '/settings/billing', icon: 'CreditCard' },
    { label: 'API Keys', href: '/settings/api-keys', icon: 'KeyRound' },
    { label: 'Credentials', href: '/settings/credentials', icon: 'Shield' },
    { label: 'Environment', href: '/settings/environment', icon: 'Wrench' },
    { label: 'Appearance', href: '/settings/appearance', icon: 'Palette' },
  ] as const; // nav now targets individual subpages instead of hash anchors
  return (
    <div className="space-y-6 w-full">
      <Separator className="border-subtle dark:border-white/10" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-10 lg:space-y-0 w-full max-w-7xl mx-auto px-4">
        <aside className="lg:w-1/4">
          <SettingsNav items={items} />
        </aside>
        <div className="flex-1 min-w-0 space-y-12">{children}</div>
      </div>
    </div>
  );
}
