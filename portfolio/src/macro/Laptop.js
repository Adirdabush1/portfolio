import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
const BASE_W = 3.6;
const BASE_D = 2.5;
const BASE_T = 0.12;
const SCREEN_TILT = 1.92; // ~110° open
const codeStyle = {
    width: 920,
    height: 580,
    background: "#0d1117",
    color: "#c9d1d9",
    fontFamily: "JetBrains Mono, ui-monospace, monospace",
    fontSize: 22,
    lineHeight: 1.5,
    padding: "28px 36px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
};
const titleBar = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
};
const dot = (c) => ({
    width: 14,
    height: 14,
    borderRadius: 14,
    background: c,
});
const C = {
    kw: "#ff7b72",
    fn: "#d2a8ff",
    str: "#a5d6ff",
    num: "#79c0ff",
    com: "#8b949e",
    pun: "#c9d1d9",
};
export default function Laptop({ position = [-3.2, 0.3, -5.5], rotationY = 0.18, }) {
    return (_jsxs("group", { position: position, rotation: [0, rotationY, 0], children: [_jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CuboidCollider, { args: [BASE_W / 2, BASE_T / 2, BASE_D / 2], position: [0, BASE_T / 2, 0] }), _jsxs("mesh", { castShadow: true, receiveShadow: true, position: [0, BASE_T / 2, 0], children: [_jsx("boxGeometry", { args: [BASE_W, BASE_T, BASE_D] }), _jsx("meshStandardMaterial", { color: "#2a2c33", roughness: 0.4, metalness: 0.5 })] }), _jsxs("mesh", { position: [0, BASE_T + 0.005, BASE_D * 0.25], children: [_jsx("boxGeometry", { args: [BASE_W * 0.4, 0.005, BASE_D * 0.32] }), _jsx("meshStandardMaterial", { color: "#1a1c20", roughness: 0.3 })] })] }), _jsxs("group", { position: [0, BASE_T, -BASE_D / 2], rotation: [-SCREEN_TILT + Math.PI / 2, 0, 0], children: [_jsxs("mesh", { castShadow: true, position: [0, BASE_D / 2, 0], children: [_jsx("boxGeometry", { args: [BASE_W, BASE_D, 0.08] }), _jsx("meshStandardMaterial", { color: "#16171c", roughness: 0.5, metalness: 0.6 })] }), _jsxs("mesh", { position: [0, BASE_D / 2, 0.043], children: [_jsx("planeGeometry", { args: [BASE_W * 0.93, BASE_D * 0.88] }), _jsx("meshStandardMaterial", { color: "#0d1117", emissive: "#0d1117", emissiveIntensity: 0.4 })] }), _jsx(Html, { transform: true, occlude: "blending", position: [0, BASE_D / 2, 0.05], distanceFactor: 2.6, children: _jsxs("div", { style: codeStyle, children: [_jsxs("div", { style: titleBar, children: [_jsx("span", { style: dot("#ff5f56") }), _jsx("span", { style: dot("#ffbd2e") }), _jsx("span", { style: dot("#27c93f") }), _jsx("span", { style: { marginLeft: 14, fontSize: 14, opacity: 0.7 }, children: "~/portfolio/macro/ToyCar.tsx" })] }), _jsx("div", { children: _jsx("span", { style: { color: C.com }, children: "// drive Adir's desk" }) }), _jsxs("div", { children: [_jsx("span", { style: { color: C.kw }, children: "const" }), " ", _jsx("span", { style: { color: C.fn }, children: "useDrive" }), " =", " ", _jsx("span", { style: { color: C.kw }, children: "(" }), _jsx("span", { style: { color: C.pun }, children: "body" }), _jsx("span", { style: { color: C.kw }, children: ")" }), " ", _jsx("span", { style: { color: C.kw }, children: "=>" }), " ", "{"] }), _jsxs("div", { style: { paddingLeft: 28 }, children: [_jsx("span", { style: { color: C.kw }, children: "const" }), " keys =", " ", _jsx("span", { style: { color: C.fn }, children: "useKeyboard" }), _jsx("span", { style: { color: C.pun }, children: "()" }), ";"] }), _jsxs("div", { style: { paddingLeft: 28 }, children: [_jsx("span", { style: { color: C.fn }, children: "useFrame" }), _jsxs("span", { style: { color: C.pun }, children: ["((_, dt) => ", `{`] })] }), _jsxs("div", { style: { paddingLeft: 56 }, children: [_jsx("span", { style: { color: C.kw }, children: "if" }), " ", _jsx("span", { style: { color: C.pun }, children: "(keys.forward)" })] }), _jsxs("div", { style: { paddingLeft: 84 }, children: ["body.", _jsx("span", { style: { color: C.fn }, children: "applyImpulse" }), `(`, "{", "y:", " ", _jsx("span", { style: { color: C.num }, children: "0" }), ", z:", " ", _jsx("span", { style: { color: C.num }, children: "-ACCEL" }), " ", "}", `)`, ";"] }), _jsxs("div", { style: { paddingLeft: 56 }, children: [_jsx("span", { style: { color: C.kw }, children: "if" }), " ", _jsx("span", { style: { color: C.pun }, children: "(keys.bounce)" })] }), _jsxs("div", { style: { paddingLeft: 84 }, children: [_jsx("span", { style: { color: C.fn }, children: "hop" }), _jsx("span", { style: { color: C.pun }, children: "(body)" }), ";", " ", _jsx("span", { style: { color: C.com }, children: "// \uD83D\uDC30" })] }), _jsx("div", { style: { paddingLeft: 28 }, children: _jsx("span", { style: { color: C.pun }, children: "});" }) }), _jsxs("div", { children: ["}", ";"] }), _jsx("div", { style: { marginTop: 12 }, children: _jsx("span", { style: { color: C.com }, children: "// adir.dev \u2014 built with three.js + rapier" }) }), _jsxs("div", { style: { marginTop: "auto", display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.5, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }, children: [_jsx("span", { children: "main *  +12 -3" }), _jsx("span", { children: "UTF-8  \u00B7  TypeScript React" })] })] }) })] })] }));
}
