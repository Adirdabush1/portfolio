import { useSyncExternalStore } from "react";
const state = {
    nearby: null,
    openBillboard: null,
    tourActive: false,
};
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => {
    listeners.add(l);
    return () => {
        listeners.delete(l);
    };
};
export const driveStore = {
    setNearby(id) {
        if (state.nearby === id)
            return;
        state.nearby = id;
        emit();
    },
    open(id) {
        state.openBillboard = id;
        emit();
    },
    close() {
        state.openBillboard = null;
        emit();
    },
    setTour(active) {
        state.tourActive = active;
        emit();
    },
    get state() {
        return state;
    },
};
export function useDriveStore(selector) {
    return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}
