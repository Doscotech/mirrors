import 'react-native-url-polyfill/auto';

// Use your existing environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Minimal mock client used when running in Node/CLI to avoid runtime errors
const mockClient: any = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
    getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
    signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    startAutoRefresh: () => {},
    stopAutoRefresh: () => {},
  },
  from: () => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: { code: 'MOCK_ERROR', message: 'Supabase not configured' } })
    })
  })
};

let cachedClient: any = null;

export const createSupabaseClient = () => {
  // If already created, return cached
  if (cachedClient) return cachedClient;

  // If running in Node (expo CLI, metro bundler exec), avoid importing AsyncStorage which assumes a browser/env with window
  if (typeof window === 'undefined') {
    cachedClient = mockClient;
    return cachedClient;
  }

  // Validate that required env vars are set
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseUrl.startsWith('https://')) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_URL is not properly configured');
    console.log('Please set EXPO_PUBLIC_SUPABASE_URL in your environment variables');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' || supabaseAnonKey.length < 10) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is not properly configured');
    console.log('Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables');
  }

  try {
    // Dynamically require to avoid execution during Node/CLI runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@supabase/supabase-js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AppState } = require('react-native');

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    // Auto-refresh token when app becomes active
    AppState.addEventListener('change', (state: string) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    cachedClient = supabase;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    cachedClient = mockClient;
    return cachedClient;
  }
};