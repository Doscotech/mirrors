import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SandboxViewMode = 'docked' | 'pip'; // Future: 'focus'

interface SandboxViewState {
  mode: SandboxViewMode;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  userDismissedPip: boolean; // Prevent auto-pop after explicit close
  lastAutoShow: string | null; // ISO timestamp of last auto switch
  setMode: (mode: SandboxViewMode) => void;
  setPipPosition: (pos: { x: number; y: number }) => void;
  setPipSize: (size: { width: number; height: number }) => void;
  markDismissed: () => void;
  markAutoShow: () => void;
}

export const useSandboxViewStore = create<SandboxViewState>()(persist(
  (set) => ({
    mode: 'docked',
    pipPosition: { x: 24, y: 24 },
    pipSize: { width: 420, height: 260 },
    userDismissedPip: false,
    lastAutoShow: null,
    setMode: (mode) => set({ mode }),
    setPipPosition: (pipPosition) => set({ pipPosition }),
    setPipSize: (pipSize) => set({ pipSize }),
    markDismissed: () => set({ userDismissedPip: true }),
    markAutoShow: () => set({ lastAutoShow: new Date().toISOString(), userDismissedPip: false }),
  }),
  {
    name: 'sandbox-view-store-v1',
    partialize: (state) => ({
      mode: state.mode,
      pipPosition: state.pipPosition,
      pipSize: state.pipSize,
      userDismissedPip: state.userDismissedPip,
      lastAutoShow: state.lastAutoShow,
    }),
  }
));
