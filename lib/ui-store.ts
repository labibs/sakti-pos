"use client";

import { create } from "zustand";

interface UIStore {
  isBottomNavVisible: boolean;
  setBottomNavVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isBottomNavVisible: true,
  setBottomNavVisible: (visible: boolean) => set({ isBottomNavVisible: visible }),
}));
