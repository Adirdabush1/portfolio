export interface TouchInput {
  forward: number;
  turn: number;
  bounce: boolean;
  reset: boolean;
  interact: boolean;
}

export const touch: TouchInput = {
  forward: 0,
  turn: 0,
  bounce: false,
  reset: false,
  interact: false,
};

export const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  if ("ontouchstart" in window) return true;
  if (navigator.maxTouchPoints > 0) return true;
  if (window.matchMedia?.("(pointer: coarse)")?.matches) return true;
  return false;
};
