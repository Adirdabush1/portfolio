import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
const HEIGHT = 1.6;
const RADIUS = 0.8;
function SteamCloud() {
    const group = useRef(null);
    const particles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
        ref: { current: null },
        phase: i * 0.7,
        speed: 0.5 + Math.random() * 0.4,
        x: (Math.random() - 0.5) * 0.6,
    })), []);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        for (const p of particles) {
            const m = p.ref.current;
            if (!m)
                continue;
            const cycle = ((t * p.speed + p.phase) % 3) / 3; // 0..1
            const y = HEIGHT + 0.15 + cycle * 1.4;
            const opacity = (1 - cycle) * 0.55;
            const s = 0.18 + cycle * 0.4;
            m.position.set(p.x + Math.sin(t + p.phase) * 0.12, y, Math.cos(t * 0.7 + p.phase) * 0.12);
            m.scale.set(s, s, s);
            const mat = m.material;
            mat.opacity = opacity;
            mat.transparent = true;
        }
    });
    return (_jsx("group", { ref: group, children: particles.map((p, i) => (_jsxs("mesh", { ref: (el) => {
                p.ref.current = el;
            }, children: [_jsx("sphereGeometry", { args: [0.45, 12, 8] }), _jsx("meshStandardMaterial", { color: "#fff", transparent: true, opacity: 0.4, depthWrite: false })] }, i))) }));
}
export default function Mug({ position = [11, 0, -2] }) {
    return (_jsxs("group", { position: position, children: [_jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CylinderCollider, { args: [HEIGHT / 2, RADIUS], position: [0, HEIGHT / 2, 0] }), _jsxs("mesh", { castShadow: true, receiveShadow: true, position: [0, HEIGHT / 2, 0], children: [_jsx("cylinderGeometry", { args: [RADIUS, RADIUS * 0.95, HEIGHT, 32] }), _jsx("meshStandardMaterial", { color: "#f5f1e8", roughness: 0.55 })] }), _jsxs("mesh", { position: [0, HEIGHT - 0.05, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("ringGeometry", { args: [0, RADIUS * 0.9, 32] }), _jsx("meshStandardMaterial", { color: "#3b2410" })] }), _jsxs("mesh", { position: [0, HEIGHT - 0.06, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("circleGeometry", { args: [RADIUS * 0.85, 32] }), _jsx("meshStandardMaterial", { color: "#5a3520", roughness: 0.85 })] })] }), _jsxs("mesh", { castShadow: true, position: [RADIUS + 0.06, HEIGHT / 2, 0], rotation: [Math.PI / 2, 0, 0], children: [_jsx("torusGeometry", { args: [0.34, 0.12, 12, 24, Math.PI] }), _jsx("meshStandardMaterial", { color: "#f5f1e8", roughness: 0.55 })] }), _jsxs("mesh", { position: [0, HEIGHT * 0.45, RADIUS + 0.001], children: [_jsx("planeGeometry", { args: [1.0, 0.22] }), _jsx("meshStandardMaterial", { color: "#0c0d10" })] }), _jsx(SteamCloud, {})] }));
}
