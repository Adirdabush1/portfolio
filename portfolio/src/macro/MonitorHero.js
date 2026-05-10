import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
const SCREEN_W = 3.6;
const SCREEN_H = 2.2;
const SCREEN_T = 0.12;
const NECK_H = 1.4;
const NAV_ITEMS = ["Home", "Dashboard", "Practice", "Profile", "Logout"];
const screenStyles = {
    width: 1280,
    height: 760,
    borderRadius: 22,
    overflow: "hidden",
    background: "radial-gradient(ellipse at top, #14151a 0%, #050507 70%)",
    color: "#0c0d10",
    fontFamily: "Poppins, system-ui, sans-serif",
    position: "relative",
    userSelect: "none",
};
const innerPanel = {
    position: "absolute",
    inset: "8% 4% 4% 4%",
    borderRadius: 28,
    background: "#dadde2",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 40,
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
};
const navPill = {
    background: "#e9ecef",
    borderRadius: 999,
    padding: "18px 44px",
    display: "flex",
    gap: 80,
    fontWeight: 700,
    fontSize: 22,
    color: "#0c0d10",
    letterSpacing: 0.3,
    marginBottom: 50,
};
const titleStyle = {
    fontSize: 78,
    fontWeight: 800,
    color: "#1a1c20",
    letterSpacing: -1,
    textAlign: "center",
    marginTop: "auto",
    marginBottom: "auto",
};
function StarDots() {
    // Procedural star field over the dark area outside the inner panel
    const dots = Array.from({ length: 60 }, (_, i) => {
        const r = (i * 9301 + 49297) % 233280;
        const x = (r % 100);
        const y = (Math.floor(r / 100) % 100);
        const size = 1 + ((i * 7) % 3);
        const opacity = 0.25 + ((i * 13) % 60) / 100;
        return (_jsx("span", { style: {
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: "#a3a8b2",
                opacity,
                pointerEvents: "none",
            } }, i));
    });
    return _jsx(_Fragment, { children: dots });
}
export default function MonitorHero({ position = [4.5, 0.3, -5], rotationY = -0.3, }) {
    const baseY = 0.07;
    const neckBottom = baseY + 0.07; // top of base
    const screenBottom = neckBottom + NECK_H;
    const screenCenterY = screenBottom + SCREEN_H / 2;
    return (_jsxs("group", { position: position, rotation: [0, rotationY, 0], children: [_jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CuboidCollider, { args: [0.6, 0.07, 0.45], position: [0, baseY, 0] }), _jsxs("mesh", { castShadow: true, position: [0, baseY, 0], children: [_jsx("cylinderGeometry", { args: [0.6, 0.7, 0.14, 24] }), _jsx("meshStandardMaterial", { color: "#16171c", roughness: 0.4, metalness: 0.6 })] })] }), _jsxs("mesh", { castShadow: true, position: [0, neckBottom + NECK_H / 2, 0], children: [_jsx("boxGeometry", { args: [0.18, NECK_H, 0.18] }), _jsx("meshStandardMaterial", { color: "#16171c", roughness: 0.4, metalness: 0.6 })] }), _jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CuboidCollider, { args: [SCREEN_W / 2, SCREEN_H / 2, SCREEN_T / 2], position: [0, screenCenterY, 0] }), _jsxs("mesh", { castShadow: true, position: [0, screenCenterY, 0], children: [_jsx("boxGeometry", { args: [SCREEN_W, SCREEN_H, SCREEN_T] }), _jsx("meshStandardMaterial", { color: "#0a0b0e", roughness: 0.55, metalness: 0.6 })] }), _jsxs("mesh", { position: [0, screenCenterY, SCREEN_T / 2 + 0.001], children: [_jsx("planeGeometry", { args: [SCREEN_W * 0.97, SCREEN_H * 0.95] }), _jsx("meshStandardMaterial", { color: "#16171c", roughness: 0.5 })] })] }), _jsx(Html, { transform: true, occlude: "blending", position: [0, screenCenterY, SCREEN_T / 2 + 0.02], distanceFactor: 2.4, children: _jsxs("div", { style: screenStyles, children: [_jsx(StarDots, {}), _jsxs("div", { style: innerPanel, children: [_jsx("div", { style: navPill, children: NAV_ITEMS.map((n) => (_jsx("span", { children: n }, n))) }), _jsx("div", { style: titleStyle, children: "Learn With Your AI Mentor" })] })] }) }), _jsxs("mesh", { position: [0, screenBottom, 0.09], children: [_jsx("boxGeometry", { args: [SCREEN_W * 0.5, 0.04, 0.03] }), _jsx("meshStandardMaterial", { color: "#55A5FE", emissive: "#55A5FE", emissiveIntensity: 1.4, toneMapped: false })] })] }));
}
