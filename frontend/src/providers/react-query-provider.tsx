'use client';

import { useState, useEffect } from 'react';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { handleApiError } from '@/lib/error-handler';
import { isLocalMode } from '@/lib/config';
import { BillingError, AgentRunLimitError } from '@/lib/api';

export function ReactQueryProvider({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: unknown;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20 * 1000,
            gcTime: 2 * 60 * 1000,
            // Retry only transient errors (network, 5xx, fetch aborted) up to 3 attempts with exp backoff
            retry: (failureCount, error: any) => {
              if (!error) return failureCount < 3; // unknown -> treat as transient
              const status = error.status || error?.response?.status;
              const message: string = error.message || '';
              const isNetwork =
                message.includes('Failed to fetch') ||
                message.includes('NetworkError') ||
                message.includes('Network request failed') ||
                typeof status === 'undefined';
              const isAbort = message.includes('AbortError') || message.includes('signal aborted');
              const isServer = status >= 500 && status < 600;
              const isRateLimit = status === 429;
              // Do not retry client logic / auth / not found
              if (status >= 400 && status < 500 && !isRateLimit) return false;
              if (status === 404) return false;
              if (failureCount >= 3) return false;
              return isNetwork || isAbort || isServer || isRateLimit;
            },
            // Backoff function (React Query uses retryDelay global option)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
          },
          mutations: {
            retry: (failureCount, error: any) => {
              if (!error) return failureCount < 2;
              const status = error.status || error?.response?.status;
              const message: string = error.message || '';
              const isNetwork =
                message.includes('Failed to fetch') ||
                message.includes('NetworkError') ||
                message.includes('Network request failed') ||
                typeof status === 'undefined';
              const isServer = status >= 500 && status < 600;
              const isRateLimit = status === 429;
              if (status >= 400 && status < 500 && !isRateLimit) return false;
              return (isNetwork || isServer || isRateLimit) && failureCount < 2; // at most 2 attempts total
            },
            onError: (error: any) => {
              if (error instanceof BillingError || error instanceof AgentRunLimitError) {
                return;
              }
              handleApiError(error, {
                operation: 'perform action',
                silent: false,
              });
            },
          },
        },
      }),
  );

  const isLocal = isLocalMode();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
        <NetworkRetryIndicator queryClient={queryClient} />
        {isLocal && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

const NetworkRetryIndicator: React.FC<{ queryClient: QueryClient }> = ({ queryClient }) => {
  const [retryingCount, setRetryingCount] = useState(0);
  useEffect(() => {
    const update = () => {
      // Count queries that are fetching with previous errors (retry scenario)
      const queries = queryClient.getQueryCache().findAll();
      const activeRetrying = queries.filter(q => {
        const state: any = q.state as any;
        return state.fetchStatus === 'fetching' && state.error; // has error & refetching => retry
      }).length;
      setRetryingCount(activeRetrying);
    };
    const unsub = queryClient.getQueryCache().subscribe(update);
    const unsubM = queryClient.getMutationCache().subscribe(update);
    update();
    return () => {
      unsub && unsub();
      unsubM && unsubM();
    };
  }, [queryClient]);

  if (retryingCount === 0) return null;
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs shadow-lg flex items-center gap-2 animate-pulse">
      <span className="inline-block h-2 w-2 rounded-full bg-white animate-ping" />
      Retrying network ({retryingCount})
    </div>
  );
};
