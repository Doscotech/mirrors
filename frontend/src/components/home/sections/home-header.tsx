'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About', hidden: true },
];

export function HomeHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="h-14 px-4 sm:px-5 flex items-center justify-between">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-primary/15 border border-primary/20" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'text-foreground/70 hover:text-foreground transition-colors',
                    pathname === l.href && 'text-foreground'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href="/docs/introduction" className="hidden sm:inline text-sm text-foreground/70 hover:text-foreground">Docs</Link>
              <Link href="/auth">
                <Button size="sm" className="rounded-full h-9 px-4">Start</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HomeHeader;
