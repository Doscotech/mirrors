'use client';

import Link from 'next/link';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import GoogleSignIn from '@/components/GoogleSignIn';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState, useEffect, Suspense } from 'react';
import { signIn, signUp, forgotPassword } from './actions';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  X,
  CheckCircle,
  AlertCircle,
  MailCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useAuthMethodTracking } from '@/lib/stores/auth-tracking';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import GitHubSignIn from '@/components/GithubSignIn';
import { Ripple } from '@/components/ui/ripple';
import { ReleaseBadge } from '@/components/auth/release-badge';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const mode = searchParams.get('mode');
  const returnUrl = searchParams.get('returnUrl');
  const message = searchParams.get('message');

  const isSignUp = mode === 'signup';
  // Phone auth state (now inline under social providers)
  const [phone, setPhone] = useState('');
  const [phoneStage, setPhoneStage] = useState<'enter' | 'code'>('enter');
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneFlowVisible, setPhoneFlowVisible] = useState(false);
  const resendActive = resendCooldown === 0;
  // Cooldown timer
  useEffect(()=>{
    if(resendCooldown <= 0) return;
    const t = setInterval(()=> setResendCooldown(c=> c>0 ? c-1 : 0),1000);
    return ()=> clearInterval(t);
  },[resendCooldown]);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mounted, setMounted] = useState(false);

  const { wasLastMethod: wasEmailLastMethod, markAsUsed: markEmailAsUsed } = useAuthMethodTracking('email');

  useEffect(() => {
    if (!isLoading && user) {
      router.push(returnUrl || '/dashboard');
    }
  }, [user, isLoading, router, returnUrl]);

  const isSuccessMessage =
    message &&
    (message.includes('Check your email') ||
      message.includes('Account created') ||
      message.includes('success'));

  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] =
    useState(!!isSuccessMessage);
  const [registrationEmail, setRegistrationEmail] = useState('');

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccessMessage) {
      setRegistrationSuccess(true);
    }
  }, [isSuccessMessage]);

  const handleSignIn = async (prevState: any, formData: FormData) => {
    markEmailAsUsed();

    if (returnUrl) {
      formData.append('returnUrl', returnUrl);
    } else {
      formData.append('returnUrl', '/dashboard');
    }
    const result = await signIn(prevState, formData);

    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      result.success &&
      'redirectTo' in result
      ) {
      window.location.href = result.redirectTo as string;
      return null;
    }

    if (result && typeof result === 'object' && 'message' in result) {
      toast.error('Login failed', {
        description: result.message as string,
        duration: 5000,
      });
      return {};
    }

    return result;
  };

  const handleSignUp = async (prevState: any, formData: FormData) => {
    markEmailAsUsed();

    const email = formData.get('email') as string;
    setRegistrationEmail(email);

    if (returnUrl) {
      formData.append('returnUrl', returnUrl);
    }

    // Add origin for email redirects
    formData.append('origin', window.location.origin);

    const result = await signUp(prevState, formData);

    // Check for success and redirectTo properties (direct login case)
    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      result.success &&
      'redirectTo' in result
    ) {
      // Use window.location for hard navigation to avoid stale state
      window.location.href = result.redirectTo as string;
      return null; // Return null to prevent normal form action completion
    }

    // Check if registration was successful but needs email verification
    if (result && typeof result === 'object' && 'message' in result) {
      const resultMessage = result.message as string;
      if (resultMessage.includes('Check your email')) {
        setRegistrationSuccess(true);

        // Update URL without causing a refresh
        const params = new URLSearchParams(window.location.search);
        params.set('message', resultMessage);

        const newUrl =
          window.location.pathname +
          (params.toString() ? '?' + params.toString() : '');

        window.history.pushState({ path: newUrl }, '', newUrl);

        return result;
      } else {
        toast.error('Sign up failed', {
          description: resultMessage,
          duration: 5000,
        });
        return {};
      }
    }

    return result;
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setForgotPasswordStatus({});

    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setForgotPasswordStatus({
        success: false,
        message: 'Please enter a valid email address',
      });
      return;
    }

    const formData = new FormData();
    formData.append('email', forgotPasswordEmail);
    formData.append('origin', window.location.origin);

    const result = await forgotPassword(null, formData);

    setForgotPasswordStatus(result);
  };

  const resetRegistrationSuccess = () => {
    setRegistrationSuccess(false);
    // Remove message from URL and set mode to signin
    const params = new URLSearchParams(window.location.search);
    params.delete('message');
    params.set('mode', 'signin');

    const newUrl =
      window.location.pathname +
      (params.toString() ? '?' + params.toString() : '');

    window.history.pushState({ path: newUrl }, '', newUrl);

    router.refresh();
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Registration success view
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-full p-4 mb-6 inline-flex">
              <MailCheck className="h-12 w-12 text-green-500 dark:text-green-400" />
            </div>

            <h1 className="text-3xl font-semibold text-foreground mb-4">
              Check your email
            </h1>

            <p className="text-muted-foreground mb-2">
              We've sent a confirmation link to:
            </p>

            <p className="text-lg font-medium mb-6">
              {registrationEmail || 'your email address'}
            </p>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-green-800 dark:text-green-400">
                Click the link in the email to activate your account. If you don't see the email, check your spam folder.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/"
                className="flex h-11 items-center justify-center px-6 text-center rounded-lg border border-border bg-background hover:bg-accent transition-colors"
              >
                Return to home
              </Link>
              <button
                onClick={resetRegistrationSuccess}
                className="flex h-11 items-center justify-center px-6 text-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const normalizePhone = (p: string) => p.replace(/[^+\d]/g,'');

  const handleSendPhoneCode = async () => {
    setPhoneError(null);
    const normalized = normalizePhone(phone);
    if(!/^\+?[1-9]\d{7,14}$/.test(normalized)) {
      setPhoneError('Enter a valid phone number in international format, e.g. +15551234567');
      return;
    }
    setSendingOtp(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: normalized, options: { channel: 'sms' }});
      if(error) {
        setPhoneError(error.message || 'Failed to send code');
        return;
      }
      setPhone(normalized);
      setPhoneStage('code');
      setResendCooldown(30);
    } catch(e:any) {
      setPhoneError(e.message || 'Unexpected error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    setPhoneError(null);
    if(!otpCode || otpCode.length < 4) {
      setPhoneError('Enter the code you received');
      return;
    }
    setVerifyingOtp(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otpCode, type: 'sms' });
      if(error) {
        setPhoneError(error.message || 'Invalid code');
        return;
      }
      // On success redirect similar to email flow
      const target = returnUrl || '/dashboard';
      window.location.href = target;
    } catch(e:any) {
      setPhoneError(e.message || 'Verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute top-6 left-6 z-10">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Xera</span>
          </Link>
        </div>
        <div className="flex min-h-screen">
          <div className="relative flex-1 flex items-center justify-center p-4 lg:p-8">
            <div className="absolute top-6 right-10 z-10">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>
            <div className="w-full max-w-sm">
              <div className="mb-4 flex items-center flex-col gap-3 sm:gap-4 justify-center">
                <ReleaseBadge className='mb-2 sm:mb-4' text="Custom Agents, Playbooks, and more!" link="/changelog" />
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground text-center leading-tight">
                  {isSignUp ? 'Create your account' : 'Log into your account'}
                </h1>
              </div>
            <div className="space-y-3 mb-4">
              <GoogleSignIn returnUrl={returnUrl || undefined} />
              <GitHubSignIn returnUrl={returnUrl || undefined} />
              {/* Phone sign in / sign up section */}
              {!phoneFlowVisible && (
                <button
                  type="button"
                  onClick={() => { setPhoneFlowVisible(true); setPhoneStage('enter'); }}
                  className="w-full h-10 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
                >Continue with Phone</button>
              )}
              {phoneFlowVisible && (
                <div className="rounded-lg border border-border/60 p-4 space-y-4 bg-background/50">
                  {phoneStage === 'enter' && (
                    <div className="space-y-3">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Phone number (e.g. +15551234567)"
                        value={phone}
                        onChange={e=> setPhone(e.target.value)}
                        className="h-10 rounded-lg"
                        autoComplete="tel"
                      />
                      {phoneError && <div className="text-xs text-destructive">{phoneError}</div>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSendPhoneCode}
                          disabled={sendingOtp}
                          className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 text-sm font-medium"
                        >{sendingOtp ? 'Sending…' : (isSignUp ? 'Send sign-up code' : 'Send login code')}</button>
                        <button
                          type="button"
                          onClick={()=> { setPhoneFlowVisible(false); setPhone(''); setPhoneError(null); }}
                          className="h-10 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent"
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                  {phoneStage === 'code' && (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">Code sent to {phone}. Enter it below to {isSignUp ? 'create your account' : 'sign in'}.</div>
                      <Input
                        id="otpCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        placeholder="Enter code"
                        value={otpCode}
                        onChange={e=> setOtpCode(e.target.value.replace(/[^0-9]/g,''))}
                        className="h-10 rounded-lg tracking-widest text-center"
                      />
                      {phoneError && <div className="text-xs text-destructive">{phoneError}</div>}
                      <button
                        type="button"
                        onClick={handleVerifyPhoneCode}
                        disabled={verifyingOtp || otpCode.length < 4}
                        className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 text-sm font-medium"
                      >{verifyingOtp ? 'Verifying…' : 'Verify & Continue'}</button>
                      <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                        <button
                          type="button"
                          onClick={()=> resendActive && handleSendPhoneCode()}
                          disabled={!resendActive || sendingOtp}
                          className="underline disabled:no-underline disabled:opacity-40"
                        >{resendActive ? 'Resend code' : `Resend in ${resendCooldown}s`}</button>
                        <button type="button" onClick={()=> { setPhoneStage('enter'); setOtpCode(''); setPhoneError(null); }} className="hover:underline">Change number</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">or email</span>
              </div>
            </div>
            <form className="space-y-3">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                className="h-10 rounded-lg"
                required
              />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="h-10 rounded-lg"
                required
              />
              {isSignUp && (
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number (optional)"
                  className="h-10 rounded-lg"
                  pattern="^[+0-9()\-\s]{7,20}$"
                />
              )}
              {isSignUp && (
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  className="h-10 rounded-lg"
                  required
                />
              )}
              <div className="pt-2">
                <div className="relative">
                  <SubmitButton
                    formAction={isSignUp ? handleSignUp : handleSignIn}
                    className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg"
                    pendingText={isSignUp ? "Creating account..." : "Signing in..."}
                  >
                    {isSignUp ? 'Create account' : 'Sign in'}
                  </SubmitButton>
                  {wasEmailLastMethod && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm">
                      <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </form>
            
            <div className="mt-4 space-y-3 text-center text-sm">
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
              
              <div>
                <Link
                  href={isSignUp 
                    ? `/auth${returnUrl ? `?returnUrl=${returnUrl}` : ''}`
                    : `/auth?mode=signup${returnUrl ? `&returnUrl=${returnUrl}` : ''}`
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex flex-1 items-center justify-center bg-sidebar relative overflow-hidden">
          <div className="absolute inset-0">
            <Ripple />
          </div>
        </div>
      </div>
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Reset Password</DialogTitle>
            </div>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              id="forgot-password-email"
              type="email"
              placeholder="Email address"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              className="h-11 rounded-xl"
              required
            />
            {forgotPasswordStatus.message && (
              <div
                className={`p-3 rounded-md flex items-center gap-3 ${
                  forgotPasswordStatus.success
                    ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-400'
                    : 'bg-destructive/10 border border-destructive/20 text-destructive'
                }`}
              >
                {forgotPasswordStatus.success ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-sm">{forgotPasswordStatus.message}</span>
              </div>
            )}
            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="h-10 px-4 border border-border bg-background hover:bg-accent transition-colors rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
              >
                Send Reset Link
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
