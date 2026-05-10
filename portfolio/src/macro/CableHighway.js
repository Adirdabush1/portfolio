import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { PROPS } from "./constants";
const TUBE_RADIUS = 0.13;
const BOOST_IMPULSE = 14;
export default function CableHighway({ carRef }) {
    const curve = useMemo(() => {
        const pts = PROPS.CABLE_PATH.map((p) => new Vector3(p[0], p[1], p[2]));
        return new CatmullRomCurve3(pts, false, "catmullrom", 0.4);
    }, []);
    const tubeGeo = useMemo(() => new TubeGeometry(curve, 80, TUBE_RADIUS, 10, false), [curve]);
    // 3 boost sensors placed along the curve
    const boostPoints = useMemo(() => {
        const pts = [];
        for (let t of [0.2, 0.5, 0.8]) {
            pts.push(curve.getPoint(t));
        }
        return pts;
    }, [curve]);
    const lastTriggerRef = useRef(0);
    return (_jsxs("group", { children: [_jsx("mesh", { castShadow: true, receiveShadow: true, geometry: tubeGeo, children: _jsx("meshStandardMaterial", { color: "#e84a3a", roughness: 0.6 }) }), _jsx("mesh", { geometry: useMemo(() => new TubeGeometry(curve, 80, TUBE_RADIUS * 0.4, 6, false), [curve]), children: _jsx("meshStandardMaterial", { color: "#ffeb6b", emissive: "#ffeb6b", emissiveIntensity: 0.8, toneMapped: false }) }), [0, PROPS.CABLE_PATH.length - 1].map((idx) => {
                const p = PROPS.CABLE_PATH[idx];
                return (_jsxs("mesh", { castShadow: true, position: [p[0], p[1], p[2]], children: [_jsx("boxGeometry", { args: [0.3, 0.18, 0.24] }), _jsx("meshStandardMaterial", { color: "#9a9aa0", roughness: 0.4, metalness: 0.7 })] }, idx));
            }), boostPoints.map((p, i) => (_jsxs(RigidBody, { type: "fixed", position: [p.x, p.y + 0.25, p.z], colliders: false, children: [_jsx(CuboidCollider, { args: [0.4, 0.4, 0.4], sensor: true, onIntersectionEnter: ({ rigidBody }) => {
                            var _a;
                            const car = (_a = carRef.current) === null || _a === void 0 ? void 0 : _a.body;
                            if (!car || rigidBody !== car)
                                return;
                            const now = performance.now();
                            if (now - lastTriggerRef.current < 400)
                                return;
                            lastTriggerRef.current = now;
                            // Boost in current forward direction
                            const linvel = car.linvel();
                            const speed = Math.hypot(linvel.x, linvel.z);
                            if (speed < 0.3)
                                return;
                            const sx = linvel.x / speed;
                            const sz = linvel.z / speed;
                            car.applyImpulse({ x: sx * BOOST_IMPULSE, y: 0, z: sz * BOOST_IMPULSE }, true);
                        } }), _jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], children: [_jsx("ringGeometry", { args: [0.35, 0.45, 24] }), _jsx("meshStandardMaterial", { color: "#ffeb6b", emissive: "#ffeb6b", emissiveIntensity: 1.4, toneMapped: false, transparent: true, opacity: 0.85 })] })] }, i)))] }));
}
