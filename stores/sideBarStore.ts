"use client";

import { create } from "zustand";

type SidebarStore = {
  mobileOpen: boolean;

  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;

  // DESKTOP

  collapsed: boolean;

  toggleCollapsed: () => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  mobileOpen: false,

  openMobile: () => set({ mobileOpen: true }),

  closeMobile: () => set({ mobileOpen: false }),

  toggleMobile: () =>
    set((state) => ({
      mobileOpen: !state.mobileOpen,
    })),

  // =====================================
  // DESKTOP
  // =====================================

  collapsed: false,

  toggleCollapsed: () =>
    set((state) => ({
      collapsed: !state.collapsed,
    })),
}));
