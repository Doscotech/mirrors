'use client';
import { HeroVideoSection } from '@/components/home/sections/hero-video-section';
import { siteConfig } from '@/lib/home';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { BillingErrorAlert } from '@/components/billing/usage-limit-alert';
import { useBillingError } from '@/hooks/useBillingError';
import { useAccounts } from '@/hooks/use-accounts';
import { isLocalMode, config } from '@/lib/config';
import { toast } from 'sonner';
import { BillingModal } from '@/components/billing/billing-modal';
import GitHubSignIn from '@/components/GithubSignIn';

// (Hero simplified: input and prompts removed)



export function HeroSection() {
  const { hero } = siteConfig;
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { billingError, handleBillingError, clearBillingError } =
    useBillingError();
  const { data: accounts } = useAccounts();
  const personalAccount = accounts?.find((account) => account.personal_account);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // removed chat input flow state

  // no auth dialog in simplified hero

  useEffect(() => {
    setMounted(true);
  }, []);

  // no chat input submission in simplified hero

  return (
    <section id="hero" className="w-full relative overflow-hidden">
      <BillingModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal}
        showUsageLimitAlert={true}
      />
      <div className="relative flex flex-col items-center w-full px-4 sm:px-6">
        {/* Simplified background (no dotted grid) */}
        <div className="absolute inset-x-0 top-0 h-[520px] sm:h-[640px] md:h-[760px] -z-20 bg-gradient-to-b from-background to-background/0"></div>

        <div className="relative z-10 pt-16 sm:pt-24 md:pt-32 mx-auto h-full w-full max-w-6xl flex flex-col items-center justify-center">
          {/* <p className="border border-border bg-accent rounded-full text-sm h-8 px-3 flex items-center gap-2">
            {hero.badgeIcon}
            {hero.badge}
          </p> */}

          {/* <Link
            href={hero.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border/50 bg-background hover:bg-accent/20 hover:border-secondary/40 rounded-full text-sm h-8 px-3 flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 hover:-translate-y-0.5"
          >
            {hero.badgeIcon}
            <span className="font-medium text-muted-foreground text-xs tracking-wide group-hover:text-primary transition-colors duration-300">
              {hero.badge}
            </span>
            <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-muted/30 group-hover:bg-secondary/30 transition-colors duration-300">
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-muted-foreground group-hover:text-primary"
              >
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link> */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pt-8 sm:pt-12 max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tighter text-balance text-center px-2">
              <span className="text-primary">Xera helps you build, manage, and train your </span>
              <span className="text-secondary">AI workforce</span>
            </h1>
            <p className="text-base md:text-lg text-center text-muted-foreground font-medium text-balance leading-relaxed tracking-tight max-w-3xl px-2">
              Xera is a SaaS platform for orchestrating autonomous AI workers and workflows. Design agents, connect tools, and ship outcomes—not prompts.
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground/90 font-medium tracking-wide uppercase flex gap-3 items-center">
              <span>Agents</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>Tools</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>Workflows</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>Observability</span>
            </p>

            <div className="mt-2 flex flex-col sm:flex-row items-center gap-2">
              <Link href="/auth">
                <Button size="lg" className="rounded-full px-6">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#process" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="rounded-full px-6">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          {/* Removed chat input and example prompts */}

        </div>

      </div>
        <div className="mb-8 sm:mb-16 sm:mt-32 mx-auto"></div>

  {/* Auth Dialog removed in simplified hero */}

      {/* Add Billing Error Alert here */}
      <BillingErrorAlert
        message={billingError?.message}
        currentUsage={billingError?.currentUsage}
        limit={billingError?.limit}
        accountId={personalAccount?.account_id}
        onDismiss={clearBillingError}
        isOpen={!!billingError}
      />

  {/* Agent run limit dialog not used in simplified hero */}
    </section>
  );
}
