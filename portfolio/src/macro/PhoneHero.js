import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
const PHONE_W = 3.5;
const PHONE_D = 7;
const PHONE_H = 0.35;
export default function PhoneHero({ position = [6, 0.6, -2], rotationY = -0.25, }) {
    return (_jsxs("group", { position: position, rotation: [0, rotationY, 0], children: [_jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CuboidCollider, { args: [PHONE_W / 2, PHONE_H / 2, PHONE_D / 2] }), _jsxs("mesh", { castShadow: true, receiveShadow: true, children: [_jsx("boxGeometry", { args: [PHONE_W, PHONE_H, PHONE_D] }), _jsx("meshStandardMaterial", { color: "#0d0e12", roughness: 0.45, metalness: 0.7 })] }), _jsxs("mesh", { position: [0, PHONE_H / 2 + 0.001, 0], rotation: [-Math.PI / 2, 0, 0], receiveShadow: true, children: [_jsx("planeGeometry", { args: [PHONE_W * 0.92, PHONE_D * 0.92] }), _jsx("meshStandardMaterial", { color: "#0a0b0f", roughness: 0.05, metalness: 0 })] }), _jsxs("mesh", { position: [0, PHONE_H / 2 + 0.0005, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("ringGeometry", { args: [PHONE_W * 0.42, PHONE_W * 0.46, 4] }), _jsx("meshStandardMaterial", { color: "#15161a" })] })] }), _jsx(Html, { transform: true, occlude: "blending", position: [0, PHONE_H / 2 + 0.02, 0], rotation: [-Math.PI / 2, 0, 0], distanceFactor: 4.5, style: {
                    width: 360,
                    height: 720,
                    borderRadius: 36,
                    overflow: "hidden",
                    padding: 0,
                    background: "linear-gradient(180deg, #0a1322 0%, #1a0f25 100%)",
                    color: "#fff",
                    fontFamily: "Poppins, system-ui, sans-serif",
                    boxShadow: "inset 0 0 40px rgba(255,255,255,0.05)",
                    userSelect: "none",
                }, children: _jsxs("div", { style: { padding: 22, height: "100%", display: "flex", flexDirection: "column", gap: 14 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75 }, children: [_jsx("span", { children: "9:41" }), _jsx("span", { children: "\u2022\u2022\u2022" })] }), _jsxs("div", { style: { marginTop: 18 }, children: [_jsx("div", { style: { fontSize: 13, opacity: 0.65, letterSpacing: 1.2, textTransform: "uppercase" }, children: "PocketProof" }), _jsx("div", { style: { fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 6 }, children: "Field docs for teams in motion." })] }), _jsxs("div", { style: {
                                marginTop: 6,
                                padding: 18,
                                borderRadius: 22,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }, children: [_jsx("div", { style: { fontSize: 12, opacity: 0.6, marginBottom: 6 }, children: "Today's report" }), _jsx("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 4 }, children: "Site B-204 \u2014 Inspection" }), _jsx("div", { style: { fontSize: 12, opacity: 0.7 }, children: "Signed \u00B7 Synced \u00B7 Audit-ready" }), _jsx("div", { style: { display: "flex", gap: 6, marginTop: 14 }, children: [0, 1, 2].map((i) => (_jsx("div", { style: {
                                            flex: 1,
                                            height: 64,
                                            borderRadius: 12,
                                            background: `linear-gradient(135deg, rgba(85,165,254,${0.3 + i * 0.15}), rgba(204,95,184,${0.3 + i * 0.15}))`,
                                        } }, i))) })] }), _jsx("div", { style: { flex: 1 } }), _jsx("button", { style: {
                                padding: "14px 18px",
                                borderRadius: 999,
                                border: "none",
                                background: "linear-gradient(315deg, #55A5FE, #A469FF, #CC5FB8)",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: 15,
                                cursor: "pointer",
                            }, onClick: (e) => {
                                e.stopPropagation();
                                window.open("https://github.com/adirdabush", "_blank");
                            }, children: "View case study \u2192" }), _jsx("div", { style: { fontSize: 11, opacity: 0.5, textAlign: "center" }, children: "Built by Adir Dabush" })] }) })] }));
}
