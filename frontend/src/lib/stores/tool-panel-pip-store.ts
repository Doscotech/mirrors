import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simplified bi-modal view model replacing legacy 'docked' | 'pip' and removing 'minimized'
// expanded: full inspection overlay (formerly docked)
// tv: floating interactive viewer (formerly pip)
export type ToolPanelViewMode = 'expanded' | 'tv';

interface ToolPanelState {
  mode: ToolPanelViewMode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  expandedWidth: number;
  userDismissed: boolean;
  lastAutoShow: string | null;
  setMode: (mode: ToolPanelViewMode) => void;
  cycleMode: () => void;
  setPosition: (pos: { x: number; y: number }) => void;
  setSize: (size: { width: number; height: number }) => void;
  setExpandedWidth: (width: number) => void;
  markDismissed: () => void;
  markAutoShow: () => void;
  clearDismissed: () => void;
}

// Migration helper for previously persisted store
interface LegacyStateV1 {
  mode: 'docked' | 'pip';
  position: { x: number; y: number };
  size: { width: number; height: number };
  userDismissed: boolean;
  lastAutoShow: string | null;
}

export const useToolPanelPiPStore = create<ToolPanelState>()(persist(
  (set, get) => ({
    mode: 'tv',
    position: { x: 0, y: 0 },
    size: { width: 520, height: 520 },
    expandedWidth: 520,
    userDismissed: false,
    lastAutoShow: null,
    setMode: (mode) => set((state) => ({
      mode,
    })),
    cycleMode: () => {
      const { mode } = get();
      const next: ToolPanelViewMode = mode === 'tv' ? 'expanded' : 'tv';
      get().setMode(next);
    },
    setPosition: (position) => set({ position }),
    setSize: (size) => set({ size }),
    setExpandedWidth: (expandedWidth) => set({ expandedWidth }),
    markDismissed: () => set({ userDismissed: true }),
    markAutoShow: () => set({ lastAutoShow: new Date().toISOString(), userDismissed: false }),
  clearDismissed: () => set({ userDismissed: false }),
  }),
  {
    name: 'tool-panel-pip-v2',
    migrate: (persisted: any): ToolPanelState => {
      if (!persisted) {
        return {
          mode: 'tv',
          position: { x: 0, y: 0 },
          size: { width: 520, height: 520 },
          expandedWidth: 520,
          userDismissed: false,
          lastAutoShow: null,
          setMode: () => {},
          cycleMode: () => {},
          setPosition: () => {},
          setSize: () => {},
          setExpandedWidth: () => {},
          markDismissed: () => {},
          markAutoShow: () => {},
          clearDismissed: () => {},
        } as any;
      }
      // If coming from v1 name, map modes
      const legacy = persisted as LegacyStateV1;
      let mappedMode: ToolPanelViewMode = 'tv';
      if (legacy.mode === 'docked') mappedMode = 'expanded';
      if (legacy.mode === 'pip') mappedMode = 'tv';
      return {
        mode: mappedMode,
        position: legacy.position || { x: 0, y: 0 },
        size: legacy.size || { width: 520, height: 520 },
        expandedWidth: 520,
        userDismissed: legacy.userDismissed ?? false,
        lastAutoShow: legacy.lastAutoShow ?? null,
        setMode: () => {},
        cycleMode: () => {},
        setPosition: () => {},
        setSize: () => {},
        setExpandedWidth: () => {},
        markDismissed: () => {},
        markAutoShow: () => {},
  clearDismissed: () => {},
      } as any;
    },
    partialize: (s) => ({
      mode: s.mode,
      position: s.position,
      size: s.size,
      expandedWidth: s.expandedWidth,
      userDismissed: s.userDismissed,
      lastAutoShow: s.lastAutoShow,
    })
  }
));
