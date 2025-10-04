import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useAccountBySlug(slug: string | undefined) {
  const supabaseClient = createClient();
  
  return useQuery({
    queryKey: ['account', 'by-slug', slug],
    queryFn: async () => {
      if (!slug) {
        throw new Error('Account slug is required');
      }
      
      const { data, error } = await supabaseClient.rpc('get_account_by_slug', {
        slug,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!slug && !!supabaseClient,
  });
}