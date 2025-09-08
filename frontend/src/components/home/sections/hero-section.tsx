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
import GitHubSignIn from '@/components/GithubSignIn';
import { motion } from 'framer-motion';
import { UnicornBackground } from './unicorn-background';
import { vujahdayScript } from '@/app/fonts';

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
    <section id="hero" className="w-full relative overflow-hidden">
      <BillingModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal}
        showUsageLimitAlert={true}
      />
      <div className="w-full h-full flex flex-col items-center text-lg text-center relative">
        <UnicornBackground />
        <div className="w-full h-full flex flex-col items-center justify-center mb-42 gap-10 pt-12">
          <div className="flex flex-col gap-3 items-center relative z-20 pt-8 pb-2">
            {!isShortScreen && (
              <motion.div
                className="flex flex-col gap-3 items-center relative z-20 pt-4 pb-2 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
              >
                <a
                  href="https://github.com/Doscotech/mirrors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 hover:bg-foreground-secondary/20 backdrop-blur-sm border border-foreground-secondary/20 rounded-full text-xs text-foreground-secondary transition-all duration-200 hover:scale-102"
                >
                  Star us on GitHub
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            )}

            <motion.h1
              className="text-6xl font-light leading-tight text-center !leading-[0.9] max-w-4xl"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ willChange: "opacity, filter", transform: "translateZ(0)" }}
            >
              Xera for
              <br />
              <span className={`italic font-normal ${vujahdayScript.className} text-[4.2rem] ml-1 leading-[1.0] text-primary`}>Autonomous Work</span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-xl text-center mt-3 text-balance"
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