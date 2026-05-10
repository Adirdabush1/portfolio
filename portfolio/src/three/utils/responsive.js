export function isMobile() {
    return false; // Always show 3D animation
}
export function isSmallScreen() {
    return window.innerWidth < 768;
}
export function getPixelRatio() {
    if (window.innerWidth < 768)
        return Math.min(window.devicePixelRatio, 1.5);
    return Math.min(window.devicePixelRatio, 2);
}
export function getParticleCount(base) {
    if (window.innerWidth < 480)
        return Math.floor(base * 0.12);
    if (window.innerWidth < 768)
        return Math.floor(base * 0.18);
    if (window.innerWidth < 1024)
        return Math.floor(base * 0.4);
    return base;
}
