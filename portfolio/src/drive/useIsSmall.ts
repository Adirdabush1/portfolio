import { useEffect, useState } from "react";

const SMALL_BREAKPOINT = 640;

export function useIsSmall(): boolean {
  const [small, setSmall] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < SMALL_BREAKPOINT,
  );
  useEffect(() => {
    const onResize = () => setSmall(window.innerWidth < SMALL_BREAKPOINT);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  return small;
}
