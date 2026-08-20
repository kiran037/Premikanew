/**
 * Premika 2.0 Global Sidebar State Store
 * Controls global drawer/sidebar visibility and navigation dispatch.
 */

import { create } from 'zustand';
import { haptic } from '@/utils/haptics';

export interface SidebarState {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isOpen: false,

  openSidebar: () => {
    haptic.light();
    set({ isOpen: true });
  },

  closeSidebar: () => {
    haptic.light();
    set({ isOpen: false });
  },

  toggleSidebar: () => {
    const next = !get().isOpen;
    haptic.light();
    set({ isOpen: next });
  },
}));
