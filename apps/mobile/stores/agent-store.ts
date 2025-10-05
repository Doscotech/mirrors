import { create } from 'zustand';
import { Agent, fetchAgents } from '@/api/agents-api';

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  fetchAvailableAgents: () => Promise<void>;
  setSelectedAgent: (agentId: string | null) => void;
  clearAgents: () => void;
}

const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  selectedAgentId: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchAvailableAgents: async () => {
    const state = get();
    
    // Cache for 5 minutes
    if (state.lastFetched && Date.now() - state.lastFetched < 5 * 60 * 1000) {
      console.log('[AgentStore] Using cached agents');
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const response = await fetchAgents({
        limit: 100,
        sort_by: 'name',
        sort_order: 'asc',
      });
      
      const agents = response.agents;
      
      // Find default agent if no agent is selected
      const defaultAgent = agents.find(a => a.is_default);
      const currentSelectedId = state.selectedAgentId;
      
      set({
        agents,
        selectedAgentId: currentSelectedId || defaultAgent?.agent_id || null,
        isLoading: false,
        lastFetched: Date.now(),
      });
      
      console.log(`[AgentStore] Fetched ${agents.length} agents`);
    } catch (error) {
      console.error('[AgentStore] Error fetching agents:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        isLoading: false,
      });
    }
  },

  setSelectedAgent: (agentId: string | null) => {
    console.log(`[AgentStore] Selected agent: ${agentId}`);
    set({ selectedAgentId: agentId });
  },

  clearAgents: () => {
    set({
      agents: [],
      selectedAgentId: null,
      isLoading: false,
      error: null,
      lastFetched: null,
    });
  },
}));

export default useAgentStore;
