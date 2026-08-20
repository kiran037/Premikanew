/**
 * App Global UI & Settings State Architecture (Shell)
 */

import { create } from 'zustand';

export interface AppState {
  isOnline: boolean;
  themePreference: 'system' | 'light' | 'dark';
  setOnlineStatus: (status: boolean) => void;
  setThemePreference: (theme: 'system' | 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  themePreference: 'system',

  setOnlineStatus: (status) => set({ isOnline: status }),
  setThemePreference: (theme) => set({ themePreference: theme }),
}));
