import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SERVER_URL } from '@/constants/Server';
import { createSupabaseClient } from '@/constants/SupabaseConfig';

export interface ModelInfo {
  id: string;
  display_name: string;
  short_name?: string;
  requires_subscription?: boolean;
}

interface ModelStoreState {
  selectedModelId: string | null;
  availableModels: ModelInfo[];
  loading: boolean;
  error: string | null;
  setSelectedModelId: (id: string | null) => void;
  setAvailableModels: (models: ModelInfo[]) => void;
  fetchAvailableModels: () => Promise<void>;
}

export const useModelStore = create<ModelStoreState>()(
  persist(
    (set, get) => ({
      selectedModelId: null,
      availableModels: [],
      loading: false,
      error: null,
      setSelectedModelId: (id) => set({ selectedModelId: id }),
      setAvailableModels: (models) => set({ availableModels: models }),
      fetchAvailableModels: async () => {
        set({ loading: true, error: null });
        try {
          // Get auth token
          const supabase = createSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.access_token) {
            throw new Error('Not authenticated');
          }

          const url = `${SERVER_URL}/billing/available-models`;
          console.log('[ModelStore] Fetching models from:', url);
          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          console.log('[ModelStore] Response status:', res.status);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          console.log('[ModelStore] Received models:', data);
          const models = (data.models || []) as ModelInfo[];
          set({ availableModels: models, loading: false });
          // If no selection, pick first allowed model
          const sel = get().selectedModelId;
          if (!sel && models.length > 0) {
            // prefer recommended
            const recommended = models.find(m => (m as any).recommended) || models[0];
            set({ selectedModelId: recommended.id });
          }
        } catch (err: any) {
          set({ loading: false, error: err?.message || String(err) });
        }
      },
    }),
    {
      name: 'mobile-model-store',
      partialize: (s) => ({ selectedModelId: s.selectedModelId }),
    }
  )
);

export default useModelStore;
