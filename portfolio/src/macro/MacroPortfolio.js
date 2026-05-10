import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useNavigate } from "react-router-dom";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import Desk from "./Desk";
import ToyCar from "./ToyCar";
import Lamp from "./Lamp";
import MonitorHero from "./MonitorHero";
import Keyboard from "./Keyboard";
import Mug from "./Mug";
import Plant from "./Plant";
import Laptop from "./Laptop";
import StickyNotes from "./StickyNotes";
import AvatarPedestal from "./AvatarPedestal";
import CableHighway from "./CableHighway";
import HUD from "./HUD";
import LoadingScreen from "../three/LoadingScreen";
import MobileJoystick from "../drive/MobileJoystick";
import { isTouchDevice } from "../drive/touch";
import { PROPS } from "./constants";
export default function MacroPortfolio() {
    const navigate = useNavigate();
    const carRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [touchMode] = useState(isTouchDevice);
    useEffect(() => {
        if (loaded)
            return;
        const id = setInterval(() => {
            setProgress((p) => {
                const next = Math.min(100, p + 18);
                if (next >= 100)
                    clearInterval(id);
                return next;
            });
        }, 120);
        return () => clearInterval(id);
    }, [loaded]);
    return (_jsxs("div", { style: { position: "fixed", inset: 0, background: "#050507", overflow: "hidden" }, children: [_jsxs(Canvas, { shadows: true, dpr: [1, 1.75], gl: { antialias: true, powerPreference: "high-performance" }, children: [_jsx(PerspectiveCamera, { makeDefault: true, fov: 45, position: [0, 4, 10], near: 0.1, far: 120 }), _jsx("color", { attach: "background", args: ["#050507"] }), _jsx("fog", { attach: "fog", args: ["#050507", 18, 55] }), _jsx("ambientLight", { intensity: 0.18 }), _jsx("hemisphereLight", { args: ["#3d4a6a", "#0a0a0d", 0.25] }), _jsx(Suspense, { fallback: null, children: _jsx(Environment, { preset: "apartment", background: false }) }), _jsx(Suspense, { fallback: null, children: _jsxs(Physics, { gravity: [0, -16, 0], children: [_jsx(Desk, {}), _jsx(Lamp, {}), _jsx(Keyboard, {}), _jsx(MonitorHero, {}), _jsx(Mug, { position: PROPS.MUG }), _jsx(Plant, { position: PROPS.PLANT }), _jsx(Laptop, { position: PROPS.LAPTOP }), _jsx(StickyNotes, { notes: PROPS.STICKY_NOTES.map((n) => ({
                                        position: n.pos,
                                        rotationY: n.rotY,
                                        color: n.color,
                                        text: n.text,
                                    })) }), _jsx(AvatarPedestal, { position: PROPS.AVATAR_NOTE.pos, rotationY: PROPS.AVATAR_NOTE.rotY }), _jsx(CableHighway, { carRef: carRef }), _jsx(ToyCar, { ref: carRef })] }) })] }), _jsx(HUD, { onClassic: () => navigate("/classic"), onDriveCity: () => navigate("/drive") }), touchMode && _jsx(MobileJoystick, {}), !loaded && (_jsx(LoadingScreen, { progress: progress, onComplete: () => setLoaded(true) }))] }));
}
