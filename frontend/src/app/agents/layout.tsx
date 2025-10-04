'use client';

import { useEffect } from 'react';
import { SidebarLeft } from '@/components/sidebar/sidebar-left';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider';

interface AgentPreviewLayoutProps {
  children: React.ReactNode;
}

export default function AgentPreviewLayout({
  children,
}: AgentPreviewLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  return (
    <OnboardingProvider>
      <SidebarProvider defaultOpen={true}>
        <SidebarLeft />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </OnboardingProvider>
  );
}
