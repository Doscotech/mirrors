// API for fetching Composio MCP apps (toolkits) for mobile
import { SERVER_URL } from '@/constants/Server';
import { createSupabaseClient } from '@/constants/SupabaseConfig';

export async function fetchComposioToolkits(search = '', category = '', cursor = '') {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (category) queryParams.append('category', category);
  if (cursor) queryParams.append('cursor', cursor);
  const response = await fetch(`${SERVER_URL}/composio/toolkits?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch MCP apps: ${errorText}`);
  }
  return response.json();
}

export async function fetchComposioCategories() {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const response = await fetch(`${SERVER_URL}/composio/categories`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch MCP categories: ${errorText}`);
  }
  return response.json();
}
