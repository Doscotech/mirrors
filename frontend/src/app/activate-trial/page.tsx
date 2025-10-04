'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Shield, ArrowRight, CheckCircle, Loader2, LogOut, Gift, Clock, Stars } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTrialStatus, useStartTrialWithoutPayment } from '@/hooks/react-query/billing/use-trial-status';
import { useSubscription } from '@/hooks/react-query/use-billing-v2';
import { Skeleton } from '@/components/ui/skeleton';
import { KortixLogo } from '@/components/sidebar/kortix-logo';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { vujahdayScript } from '@/app/fonts';
import { clearUserLocalStorage } from '@/lib/utils/clear-local-storage';
import { useMaintenanceNoticeQuery } from '@/hooks/react-query/edge-flags';
import { MaintenanceAlert } from '@/components/maintenance-alert';
import { useAuth } from '@/components/AuthProvider';

export default function ActivateTrialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription(!!user);
  const { data: trialStatus, isLoading: isLoadingTrial } = useTrialStatus(!!user);
  const startTrialMutation = useStartTrialWithoutPayment();
  const { data: maintenanceNotice, isLoading: maintenanceLoading } = useMaintenanceNoticeQuery();

  useEffect(() => {
    if (!isLoadingSubscription && !isLoadingTrial && subscription && trialStatus) {
      const hasActiveTrial = trialStatus.has_trial && trialStatus.trial_status === 'active';
      const hasUsedTrial = trialStatus.trial_status === 'used' || 
                           trialStatus.trial_status === 'expired' || 
                           trialStatus.trial_status === 'cancelled' ||
                           trialStatus.trial_status === 'converted';
      const hasActiveSubscription = subscription.tier && 
                                   subscription.tier.name !== 'none' && 
                                   subscription.tier.name !== 'free';
      
      if (hasActiveTrial || hasActiveSubscription) {
        router.push('/dashboard');
      } else if (hasUsedTrial) {
        router.push('/subscription');
      }
    }
  }, [subscription, trialStatus, isLoadingSubscription, isLoadingTrial, router]);

  const handleStartTrial = async () => {
    try {
      const result = await startTrialMutation.mutateAsync();
      
      // No redirect to Stripe - trial is activated immediately
      // Redirect to dashboard after successful activation
      router.push('/dashboard?trial=started');
    } catch (error: any) {
      console.error('Failed to start trial:', error);
      // Error is already handled by the hook's onError
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUserLocalStorage();
    router.push('/auth');
  };

  const isMaintenanceLoading = maintenanceLoading;

  if (isMaintenanceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (maintenanceNotice?.enabled) {
    return <MaintenanceAlert open={true} onOpenChange={() => {}} closeable={false} />;
  }

  const isLoading = isLoadingSubscription || isLoadingTrial;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background/98 to-background/95">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logout button */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2 rounded-xl"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log Out</span>
        </Button>
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-6">
            <h1 className={`text-6xl md:text-7xl font-bold tracking-tight ${vujahdayScript.className}`} style={{ fontStyle: 'italic', color: 'hsl(var(--primary))' }}>
              Xera
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground/90">
            Welcome
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your journey with a <span className="font-semibold text-foreground">7-day free trial</span> - no credit card required
          </p>
        </div>

        {/* Main content card */}
        <div className="rounded-3xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 shadow-xl p-8 md:p-12 space-y-8">
          {/* Trial badge */}
          <div className="flex justify-center">
            <Badge className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 text-sm font-semibold">
              <Gift className="h-4 w-4 mr-2" />
              Limited Time Offer
            </Badge>
          </div>

          {/* Features grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What's included</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div className="group rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">$20 in Credits</h3>
                    <p className="text-sm text-muted-foreground">Full access to all premium AI models including GPT-4, Claude, and more</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-6 hover:shadow-lg hover:border-emerald-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">7 Days Free</h3>
                    <p className="text-sm text-muted-foreground">Explore all features with no commitments - cancel anytime</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-6 hover:shadow-lg hover:border-purple-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Unlimited Agents</h3>
                    <p className="text-sm text-muted-foreground">Create and deploy as many AI agents as you need</p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-6 hover:shadow-lg hover:border-blue-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Premium Support</h3>
                    <p className="text-sm text-muted-foreground">Priority access to our support team and resources</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No payment required notice */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">No payment required</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start your free trial immediately without entering any payment details. 
                  Experience the full power of Xera with zero commitment and no credit card needed.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button 
              onClick={handleStartTrial}
              disabled={startTrialMutation.isPending}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl hover:shadow-primary/25 transition-all text-base font-semibold"
              size="lg"
            >
              {startTrialMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Activating trial...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start 7-Day Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              By starting your trial, you agree to our{' '}
              <Link href="/legal?tab=terms" className="underline hover:text-primary transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal?tab=privacy" className="underline hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Instant activation</span>
          </div>
        </div>
      </div>
    </div>
  );
} 