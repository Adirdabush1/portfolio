import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useNavigate } from "react-router-dom";
import { PerspectiveCamera } from "@react-three/drei";
import World from "./World";
import Car from "./Car";
import Billboards from "./Billboards";
import Props from "./Props";
import HUD from "./HUD";
import BillboardModal from "./BillboardModal";
import MobileJoystick from "./MobileJoystick";
import LoadingScreen from "../three/LoadingScreen";
import { isTouchDevice } from "./touch";
import { runTour, stopTour } from "./TourMode";
import { driveStore } from "./useDriveStore";
import { useIsSmall } from "./useIsSmall";
export default function DrivePortfolio() {
    const navigate = useNavigate();
    const carRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [touchMode] = useState(isTouchDevice);
    const small = useIsSmall();
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
    const handleTour = () => {
        var _a, _b;
        const body = (_b = (_a = carRef.current) === null || _a === void 0 ? void 0 : _a.body) !== null && _b !== void 0 ? _b : null;
        if (driveStore.state.tourActive) {
            stopTour(body);
            return;
        }
        if (!body)
            return;
        runTour(body, () => { });
    };
    const wrapperStyle = {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        background: "#0a0f0f",
        overflow: "hidden",
    };
    // Wider FOV on small screens so more world is visible in portrait
    const fov = small ? 70 : 55;
    return (_jsxs("div", { style: wrapperStyle, children: [_jsxs(Canvas, { shadows: true, dpr: [1, 1.75], gl: { antialias: true, powerPreference: "high-performance" }, resize: { scroll: false, debounce: { scroll: 0, resize: 0 } }, children: [_jsx(PerspectiveCamera, { makeDefault: true, fov: fov, position: [0, 6, 16] }), _jsx(Suspense, { fallback: null, children: _jsxs(Physics, { gravity: [0, -28, 0], children: [_jsx(World, {}), _jsx(Props, { carRef: carRef }), _jsx(Car, { ref: carRef }), _jsx(Suspense, { fallback: null, children: _jsx(Billboards, {}) })] }) })] }), _jsx(HUD, { onTour: handleTour, onClassic: () => navigate("/classic") }), touchMode && _jsx(MobileJoystick, {}), _jsx(BillboardModal, {}), !loaded && (_jsx(LoadingScreen, { progress: progress, onComplete: () => setLoaded(true) }))] }));
}
