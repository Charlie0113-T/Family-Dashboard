// useAppStore - Global application state using Zustand
// Manages auth state, active module, and UI state

import { create } from 'zustand';

interface AppState {
  // Auth
  isUnlocked: boolean;
  isSetup: boolean;
  setUnlocked: (unlocked: boolean) => void;
  setIsSetup: (setup: boolean) => void;

  // Navigation
  activeModuleId: string | null;
  setActiveModule: (id: string | null) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  isUnlocked: false,
  isSetup: false,
  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  setIsSetup: (setup) => set({ isSetup: setup }),

  // Navigation
  activeModuleId: null,
  setActiveModule: (id) => set({ activeModuleId: id }),

  // UI
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
