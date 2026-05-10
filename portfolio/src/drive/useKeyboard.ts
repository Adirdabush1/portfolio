import { useEffect, useRef } from "react";

export interface DriveInput {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  bounce: boolean;
  reset: boolean;
  interact: boolean;
}

const initial = (): DriveInput => ({
  forward: false,
  back: false,
  left: false,
  right: false,
  bounce: false,
  reset: false,
  interact: false,
});

const keymap: Record<string, keyof DriveInput> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "bounce",
  KeyR: "reset",
  KeyE: "interact",
  Enter: "interact",
};

export function useKeyboard() {
  const ref = useRef<DriveInput>(initial());

  useEffect(() => {
    const handle = (down: boolean) => (e: KeyboardEvent) => {
      const action = keymap[e.code];
      if (!action) return;
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      }
      if (action === "bounce" || action === "reset" || action === "interact") {
        e.preventDefault();
      }
      ref.current[action] = down;
    };
    const onDown = handle(true);
    const onUp = handle(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    const blur = () => {
      ref.current = initial();
    };
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return ref;
}
