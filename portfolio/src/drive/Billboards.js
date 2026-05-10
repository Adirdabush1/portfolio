import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Text } from "@react-three/drei";
import { BILLBOARDS } from "./constants";
import { driveStore, useDriveStore } from "./useDriveStore";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
// Use a single Latin character glyph cache so Troika never has to fetch
// a font over the network — every label still renders in the default font.
const FONT_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·—'!?";
function Billboard({ config }) {
    var _a, _b;
    const nearby = useDriveStore((s) => s.nearby);
    const isNear = nearby === config.id;
    const emissive = isNear ? config.color : "#000000";
    const emissiveIntensity = isNear ? 0.55 : 0;
    const scale = (_a = config.scale) !== null && _a !== void 0 ? _a : 1;
    return (_jsxs("group", { position: config.position, rotation: [0, (_b = config.rotationY) !== null && _b !== void 0 ? _b : 0, 0], scale: [scale, scale, scale], children: [_jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CuboidCollider, { args: [0.1, 1.1, 0.1], position: [0, 1.1, 0] }), _jsxs("mesh", { castShadow: true, position: [0, 1.1, 0], children: [_jsx("cylinderGeometry", { args: [0.08, 0.08, 2.2, 12] }), _jsx("meshStandardMaterial", { color: "#1a1a1a" })] })] }), _jsxs("mesh", { position: [0, 2.7, 0], castShadow: true, onClick: (e) => {
                    e.stopPropagation();
                    driveStore.open(config.id);
                }, children: [_jsx("boxGeometry", { args: [2.4, 1.2, 0.12] }), _jsx("meshStandardMaterial", { color: config.color, emissive: emissive, emissiveIntensity: emissiveIntensity, roughness: 0.55 })] }), _jsx(Text, { position: [0, 2.85, 0.07], fontSize: 0.25, anchorX: "center", anchorY: "middle", color: "#ffffff", outlineWidth: 0.005, outlineColor: "#00000080", characters: FONT_CHARS, children: config.label }), config.sublabel && (_jsx(Text, { position: [0, 2.55, 0.07], fontSize: 0.13, anchorX: "center", anchorY: "middle", color: "#ffffff", fillOpacity: 0.85, children: config.sublabel })), isNear && (_jsx(Text, { position: [0, 3.6, 0], fontSize: 0.18, anchorX: "center", anchorY: "middle", color: "#ffffff", outlineWidth: 0.01, outlineColor: "#000000", children: "Press E to open" }))] }));
}
export default function Billboards() {
    return (_jsx(_Fragment, { children: BILLBOARDS.map((c) => (_jsx(Billboard, { config: c }, c.id))) }));
}
