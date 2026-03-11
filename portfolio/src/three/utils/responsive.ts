export function isMobile(): boolean {
  return false; // Always show 3D animation
}

export function isSmallScreen(): boolean {
  return window.innerWidth < 768;
}

export function getPixelRatio(): number {
  if (window.innerWidth < 768) return 1;
  return Math.min(window.devicePixelRatio, 2);
}

export function getParticleCount(base: number): number {
  if (window.innerWidth < 768) return Math.floor(base * 0.25);
  if (window.innerWidth < 1024) return Math.floor(base * 0.4);
  return base;
}
