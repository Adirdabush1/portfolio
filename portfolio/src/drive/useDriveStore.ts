import { useSyncExternalStore } from "react";
import type { BillboardKind } from "./constants";

interface DriveState {
  nearby: BillboardKind | null;
  openBillboard: BillboardKind | null;
  tourActive: boolean;
}

const state: DriveState = {
  nearby: null,
  openBillboard: null,
  tourActive: false,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const driveStore = {
  setNearby(id: BillboardKind | null) {
    if (state.nearby === id) return;
    state.nearby = id;
    emit();
  },
  open(id: BillboardKind) {
    state.openBillboard = id;
    emit();
  },
  close() {
    state.openBillboard = null;
    emit();
  },
  setTour(active: boolean) {
    state.tourActive = active;
    emit();
  },
  get state() {
    return state;
  },
};

export function useDriveStore<T>(selector: (s: DriveState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}
