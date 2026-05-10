export const touch = {
    forward: 0,
    turn: 0,
    bounce: false,
    reset: false,
    interact: false,
};
export const isTouchDevice = () => {
    var _a, _b;
    if (typeof window === "undefined")
        return false;
    if ("ontouchstart" in window)
        return true;
    if (navigator.maxTouchPoints > 0)
        return true;
    if ((_b = (_a = window.matchMedia) === null || _a === void 0 ? void 0 : _a.call(window, "(pointer: coarse)")) === null || _b === void 0 ? void 0 : _b.matches)
        return true;
    return false;
};
