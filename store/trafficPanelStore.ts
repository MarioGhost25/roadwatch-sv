import { create } from "zustand";

interface TrafficPanelState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export const useTrafficPanelStore = create<TrafficPanelState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
