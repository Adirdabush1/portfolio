import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef } from "react";
import { CuboidCollider, CylinderCollider, RigidBody, } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { CAR, PROPS } from "./constants";
function BowlingPin({ position }) {
    return (_jsxs(RigidBody, { colliders: "hull", position: position, mass: 0.4, linearDamping: 0.6, angularDamping: 0.4, restitution: 0.2, children: [_jsxs("mesh", { castShadow: true, position: [0, 0.45, 0], children: [_jsx("cylinderGeometry", { args: [0.18, 0.28, 0.9, 14] }), _jsx("meshStandardMaterial", { color: "#fafafa" })] }), _jsxs("mesh", { castShadow: true, position: [0, 0.95, 0], children: [_jsx("sphereGeometry", { args: [0.2, 14, 10] }), _jsx("meshStandardMaterial", { color: "#fafafa" })] }), _jsxs("mesh", { position: [0, 0.7, 0], children: [_jsx("cylinderGeometry", { args: [0.21, 0.21, 0.08, 14] }), _jsx("meshStandardMaterial", { color: "#d8392a" })] })] }));
}
function Ramp({ position, rot }) {
    return (_jsx(RigidBody, { type: "fixed", colliders: "trimesh", position: position, rotation: [0, rot, 0], children: _jsxs("mesh", { castShadow: true, receiveShadow: true, position: [0, 0.4, 0], rotation: [0, 0, -Math.PI / 14], children: [_jsx("boxGeometry", { args: [5.5, 0.3, 4] }), _jsx("meshStandardMaterial", { color: "#9a9aa0" })] }) }));
}
function Cone({ position }) {
    return (_jsxs(RigidBody, { colliders: "hull", position: position, mass: 0.2, restitution: 0.3, children: [_jsxs("mesh", { castShadow: true, position: [0, 0.45, 0], children: [_jsx("coneGeometry", { args: [0.28, 0.9, 12] }), _jsx("meshStandardMaterial", { color: "#e87a3a" })] }), _jsxs("mesh", { position: [0, 0.4, 0], children: [_jsx("torusGeometry", { args: [0.27, 0.05, 8, 14] }), _jsx("meshStandardMaterial", { color: "#ffffff" })] })] }));
}
function BouncePad({ position, carRef, }) {
    const lastTriggerRef = useRef(0);
    const ringRef = useRef(null);
    useFrame((state) => {
        if (!ringRef.current)
            return;
        const t = state.clock.elapsedTime;
        const s = 1 + Math.sin(t * 3 + position[0]) * 0.08;
        ringRef.current.scale.set(s, 1, s);
    });
    return (_jsxs(RigidBody, { type: "fixed", position: position, colliders: false, children: [_jsx(CuboidCollider, { args: [1.4, 0.6, 1.4], position: [0, 0.6, 0], sensor: true, onIntersectionEnter: ({ rigidBody }) => {
                    var _a;
                    const car = (_a = carRef.current) === null || _a === void 0 ? void 0 : _a.body;
                    if (!car || rigidBody !== car)
                        return;
                    const now = performance.now();
                    if (now - lastTriggerRef.current < 700)
                        return;
                    lastTriggerRef.current = now;
                    car.applyImpulse({ x: 0, y: CAR.PAD_BOUNCE_IMPULSE, z: 0 }, true);
                } }), _jsxs("mesh", { receiveShadow: true, castShadow: true, position: [0, 0.05, 0], children: [_jsx("cylinderGeometry", { args: [1.4, 1.4, 0.1, 24] }), _jsx("meshStandardMaterial", { color: "#1a1a22" })] }), _jsxs("mesh", { position: [0, 0.12, 0], children: [_jsx("cylinderGeometry", { args: [1.25, 1.25, 0.05, 24] }), _jsx("meshStandardMaterial", { color: "#ffd23a", emissive: "#ffd23a", emissiveIntensity: 0.5 })] }), _jsxs("mesh", { ref: ringRef, position: [0, 0.18, 0], children: [_jsx("torusGeometry", { args: [1.05, 0.06, 8, 24] }), _jsx("meshStandardMaterial", { color: "#d8392a", emissive: "#d8392a", emissiveIntensity: 0.4 })] })] }));
}
function LampPost({ position }) {
    return (_jsxs("group", { position: position, children: [_jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CuboidCollider, { args: [0.15, 2, 0.15], position: [0, 2, 0] }), _jsxs("mesh", { castShadow: true, position: [0, 2, 0], children: [_jsx("cylinderGeometry", { args: [0.1, 0.13, 4, 10] }), _jsx("meshStandardMaterial", { color: "#1a1a22" })] }), _jsxs("mesh", { position: [0.6, 3.95, 0], children: [_jsx("boxGeometry", { args: [1.2, 0.1, 0.1] }), _jsx("meshStandardMaterial", { color: "#1a1a22" })] })] }), _jsxs("mesh", { position: [1.1, 3.85, 0], children: [_jsx("boxGeometry", { args: [0.4, 0.18, 0.4] }), _jsx("meshStandardMaterial", { color: "#ffe6b0", emissive: "#ffe6b0", emissiveIntensity: 1.2 })] }), _jsx("pointLight", { position: [1.1, 3.7, 0], intensity: 0.9, distance: 14, color: "#ffe6b0" })] }));
}
function Spire({ position }) {
    return (_jsxs("group", { position: position, children: [_jsxs(RigidBody, { type: "fixed", colliders: false, children: [_jsx(CylinderCollider, { args: [6, 1.8], position: [0, 6, 0] }), _jsxs("mesh", { castShadow: true, position: [0, 0.6, 0], children: [_jsx("cylinderGeometry", { args: [3.2, 3.6, 1.2, 8] }), _jsx("meshStandardMaterial", { color: "#22232c", roughness: 0.6 })] }), _jsxs("mesh", { castShadow: true, position: [0, 5.5, 0], children: [_jsx("cylinderGeometry", { args: [1.4, 1.8, 9, 6] }), _jsx("meshStandardMaterial", { color: "#3a6df0", emissive: "#3a6df0", emissiveIntensity: 0.25 })] }), _jsxs("mesh", { castShadow: true, position: [0, 11.5, 0], children: [_jsx("coneGeometry", { args: [1.4, 3, 6] }), _jsx("meshStandardMaterial", { color: "#A469FF", emissive: "#A469FF", emissiveIntensity: 0.4 })] })] }), _jsx("pointLight", { position: [0, 13, 0], intensity: 2.4, distance: 28, color: "#A469FF" })] }));
}
function ZonePillar({ position, color }) {
    return (_jsxs(RigidBody, { type: "fixed", colliders: "cuboid", position: position, children: [_jsxs("mesh", { castShadow: true, position: [0, 1.5, 0], children: [_jsx("boxGeometry", { args: [0.6, 3, 0.6] }), _jsx("meshStandardMaterial", { color: "#1a1a22" })] }), _jsxs("mesh", { position: [0, 3.1, 0], children: [_jsx("boxGeometry", { args: [1, 0.2, 1] }), _jsx("meshStandardMaterial", { color: color, emissive: color, emissiveIntensity: 0.5 })] })] }));
}
export default function Props({ carRef }) {
    return (_jsxs(_Fragment, { children: [_jsx(Spire, { position: PROPS.SPIRE }), PROPS.RAMPS.map((r, i) => (_jsx(Ramp, { position: r.pos, rot: r.rot }, `ramp-${i}`))), PROPS.BOWLING_PINS.map((p, i) => (_jsx(BowlingPin, { position: p }, `pin-${i}`))), PROPS.CONES.map((p, i) => (_jsx(Cone, { position: p }, `cone-${i}`))), PROPS.BOUNCE_PADS.map((p, i) => (_jsx(BouncePad, { position: p, carRef: carRef }, `pad-${i}`))), PROPS.LAMPPOSTS.map((p, i) => (_jsx(LampPost, { position: p }, `lamp-${i}`))), _jsx(ZonePillar, { position: [20, 0, -20], color: "#3a6df0" }), _jsx(ZonePillar, { position: [20, 0, 20], color: "#3aa86b" }), _jsx(ZonePillar, { position: [-20, 0, 20], color: "#e07a3a" }), _jsx(ZonePillar, { position: [-20, 0, -20], color: "#9b59f6" })] }));
}
