import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { touch } from "./touch";
import { driveStore, useDriveStore } from "./useDriveStore";
import { BILLBOARDS } from "./constants";
const BASE_SIZE = 120;
const KNOB_SIZE = 56;
const MAX_OFFSET = (BASE_SIZE - KNOB_SIZE) / 2;
const SAFE_BOTTOM = "max(20px, env(safe-area-inset-bottom))";
const baseStyle = {
    position: "fixed",
    left: 20,
    bottom: SAFE_BOTTOM,
    width: BASE_SIZE,
    height: BASE_SIZE,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "2px solid rgba(255,255,255,0.18)",
    touchAction: "none",
    zIndex: 7,
    userSelect: "none",
};
const knobStyle = {
    position: "absolute",
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.85)",
    top: (BASE_SIZE - KNOB_SIZE) / 2,
    left: (BASE_SIZE - KNOB_SIZE) / 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    transition: "transform 0.06s linear",
    pointerEvents: "none",
};
const buttonStyle = {
    position: "fixed",
    right: 20,
    bottom: SAFE_BOTTOM,
    width: 76,
    height: 76,
    borderRadius: "50%",
    border: "none",
    background: "#3aa86b",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.5,
    zIndex: 7,
    touchAction: "none",
    boxShadow: "0 6px 18px rgba(58,168,107,0.4)",
};
const resetButtonStyle = {
    position: "fixed",
    right: 106,
    bottom: SAFE_BOTTOM,
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    zIndex: 7,
    touchAction: "none",
};
const openButtonStyle = {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: `calc(${SAFE_BOTTOM} + 88px)`,
    background: "linear-gradient(315deg, #55A5FE, #A469FF, #CC5FB8)",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.5,
    zIndex: 8,
    touchAction: "none",
    boxShadow: "0 8px 22px rgba(118, 95, 224, 0.5)",
    fontFamily: "Poppins, system-ui, sans-serif",
};
export default function MobileJoystick() {
    const [knob, setKnob] = useState({ x: 0, y: 0 });
    const activeId = useRef(null);
    const baseRef = useRef(null);
    const nearby = useDriveStore((s) => s.nearby);
    const nearbyConfig = nearby ? BILLBOARDS.find((b) => b.id === nearby) : null;
    useEffect(() => {
        return () => {
            touch.forward = 0;
            touch.turn = 0;
        };
    }, []);
    const handleStart = (e) => {
        if (!baseRef.current)
            return;
        activeId.current = e.pointerId;
        baseRef.current.setPointerCapture(e.pointerId);
        update(e);
    };
    const handleMove = (e) => {
        if (activeId.current !== e.pointerId)
            return;
        update(e);
    };
    const handleEnd = (e) => {
        if (activeId.current !== e.pointerId)
            return;
        activeId.current = null;
        setKnob({ x: 0, y: 0 });
        touch.forward = 0;
        touch.turn = 0;
    };
    const update = (e) => {
        if (!baseRef.current)
            return;
        const rect = baseRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = e.clientX - cx;
        let dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > MAX_OFFSET) {
            dx = (dx / dist) * MAX_OFFSET;
            dy = (dy / dist) * MAX_OFFSET;
        }
        setKnob({ x: dx, y: dy });
        touch.forward = -dy / MAX_OFFSET;
        touch.turn = dx / MAX_OFFSET;
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: baseRef, style: baseStyle, onPointerDown: handleStart, onPointerMove: handleMove, onPointerUp: handleEnd, onPointerCancel: handleEnd, children: _jsx("div", { style: Object.assign(Object.assign({}, knobStyle), { transform: `translate(${knob.x}px, ${knob.y}px)` }) }) }), _jsx("button", { style: resetButtonStyle, onPointerDown: () => {
                    touch.reset = true;
                }, children: "Reset" }), _jsx("button", { style: buttonStyle, onPointerDown: () => {
                    touch.bounce = true;
                }, children: "BOUNCE" }), nearbyConfig && (_jsxs("button", { style: openButtonStyle, onPointerDown: () => {
                    driveStore.open(nearbyConfig.id);
                }, children: ["Open \u00B7 ", nearbyConfig.label] }))] }));
}
