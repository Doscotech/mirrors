import { SERVER_URL } from '@/constants/Server';
import { createSupabaseClient } from '@/constants/SupabaseConfig';

export interface Agent {
  agent_id: string;
  name: string;
  description?: string;
  system_prompt: string;
  model: string;
  configured_mcps: any[];
  custom_mcps?: any[];
  agentpress_tools: Record<string, any>;
  is_default: boolean;
  is_public?: boolean;
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  current_version_id?: string;
  version_count?: number;
  template_id?: string;
  marketplace_published_at?: string;
  download_count?: number;
  tags?: string[];
}

export interface AgentsResponse {
  agents: Agent[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface FetchAgentsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  has_default?: boolean;
  has_mcp_tools?: boolean;
  has_agentpress_tools?: boolean;
}

export async function fetchAgents(params: FetchAgentsParams = {}): Promise<AgentsResponse> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);
  if (params.has_default !== undefined) queryParams.append('has_default', params.has_default.toString());
  if (params.has_mcp_tools !== undefined) queryParams.append('has_mcp_tools', params.has_mcp_tools.toString());
  if (params.has_agentpress_tools !== undefined) queryParams.append('has_agentpress_tools', params.has_agentpress_tools.toString());
  
  const response = await fetch(`${SERVER_URL}/agents?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch agents: ${errorText}`);
  }
  
  return response.json();
}

export async function createAgent(data: {
  name: string;
  description?: string;
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  agentpress_tools?: Record<string, any>;
  is_default?: boolean;
}): Promise<Agent> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create agent: ${errorText}`);
  }
  
  return response.json();
}

export async function updateAgent(agentId: string, data: Partial<Agent>): Promise<Agent> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/agents/${agentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update agent: ${errorText}`);
  }
  
  return response.json();
}

export async function deleteAgent(agentId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/agents/${agentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete agent: ${errorText}`);
  }
}

// Publish agent as template to marketplace
export async function publishAgent(agentId: string): Promise<{ template_id: string }> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/agents/${agentId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to publish agent: ${errorText}`);
  }
  
  return response.json();
}

// Unpublish template from marketplace
export async function unpublishAgent(templateId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/templates/${templateId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to unpublish template: ${errorText}`);
  }
}

// Fetch marketplace templates (published agents)
export async function fetchMarketplaceTemplates(params: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
} = {}): Promise<{
  templates: Agent[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
  
  const response = await fetch(`${SERVER_URL}/templates/marketplace?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch marketplace templates: ${errorText}`);
  }
  
  return response.json();
}

// Install template as new agent
export async function installTemplate(templateId: string): Promise<Agent> {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/templates/${templateId}/install`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to install template: ${errorText}`);
  }
  
  return response.json();
}

