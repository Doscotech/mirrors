'use client';

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
import { motion } from 'framer-motion';
import { UnicornBackground } from './unicorn-background';
// Xera typography uses global utilities defined in globals.css

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

  const [isShortScreen, setIsShortScreen] = useState(false);

  useEffect(() => {
      const checkScreenHeight = () => {
          setIsShortScreen(window.innerHeight < 700);
      };
      checkScreenHeight();
      window.addEventListener('resize', checkScreenHeight);
      return () => window.removeEventListener('resize', checkScreenHeight);
  }, []);

  return (
    <section id="hero" className="w-full relative overflow-hidden min-h-screen">
      <BillingModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal}
        showUsageLimitAlert={true}
      />
  <div className="w-full min-h-screen flex flex-col items-center justify-center text-lg text-center relative">
  <UnicornBackground />
        {/* Light mode overlays: subtle color glows and rings, fully transparent base */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20 dark:hidden"
          style={{
            background:
              'radial-gradient(900px 360px at 10% 0%, rgba(6,182,212,0.12), transparent 60%),' +
              'radial-gradient(700px 300px at 90% 10%, rgba(139,92,246,0.10), transparent 60%),' +
              'radial-gradient(600px 240px at 50% 100%, rgba(244,63,94,0.08), transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18] dark:hidden"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at 15% -10%, rgba(6,182,212,0.20) 0px, rgba(6,182,212,0.20) 1px, transparent 2px, transparent 24px),' +
              'repeating-radial-gradient(circle at 85% 0%, rgba(139,92,246,0.16) 0px, rgba(139,92,246,0.16) 1px, transparent 2px, transparent 22px)',
          }}
        />

        {/* Dark mode overlays only; light mode stays fully transparent */}
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block opacity-60"
          style={{
            background:
              'radial-gradient(900px 360px at 10% 0%, rgba(6,182,212,0.12), transparent 60%),' +
              'radial-gradient(700px 300px at 90% 10%, rgba(139,92,246,0.10), transparent 60%),' +
              'radial-gradient(600px 240px at 50% 100%, rgba(244,63,94,0.08), transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.14]"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at 15% -10%, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 2px, transparent 26px),' +
              'repeating-radial-gradient(circle at 85% 0%, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 2px, transparent 22px)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,182,212,0.06), transparent 22%, transparent 78%, rgba(244,63,94,0.06)),' +
              'linear-gradient(90deg, rgba(6,182,212,0.05), transparent 18%, transparent 82%, rgba(139,92,246,0.05))',
          }}
        />
  <div className="w-full flex flex-col items-center justify-center gap-10 pt-0">
          <div className="flex flex-col gap-3 items-center relative z-20 pt-0 pb-2">
            {!isShortScreen && (
              <></>
            )}

            <motion.h1
              className="xera-display text-center max-w-4xl"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ willChange: "opacity, filter", transform: "translateZ(0)" }}
            >
              Xera for
              <br />
              <span className="xera-accent xera-accent-lg xera-accent-primary ml-1">Autonomous Work</span>
            </motion.h1>

            <motion.p
              className="xera-subtitle max-w-xl text-center mt-3"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              style={{ willChange: "opacity, filter", transform: "translateZ(0)" }}
            >
              Build agents. Connect tools. Ship outcomes.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-3 text-sm mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <span className="px-4 py-1.5 rounded-full bg-foreground-secondary/10 backdrop-blur-sm text-foreground-secondary">Agents</span>
              <span className="px-4 py-1.5 rounded-full bg-foreground-secondary/10 backdrop-blur-sm text-foreground-secondary">Tools</span>
              <span className="px-4 py-1.5 rounded-full bg-foreground-secondary/10 backdrop-blur-sm text-foreground-secondary">Workflows</span>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
            >
              <Link href="/auth">
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-200 h-12"
                >
                  Start building
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {/* Removed GitHub link/button per request */}
            </motion.div>
          </div>
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
    </section>
  );
}