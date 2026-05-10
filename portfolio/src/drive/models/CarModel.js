import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
const CAR_URL = "/models/drive/cybertruck.glb";
useGLTF.preload(CAR_URL);
export function CarModel() {
    const { scene } = useGLTF(CAR_URL);
    useEffect(() => {
        scene.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
    }, [scene]);
    return _jsx("primitive", { object: scene });
}
export function CarFallback() {
    return (_jsxs("group", { children: [_jsxs("mesh", { castShadow: true, position: [0, 0.35, 0], children: [_jsx("boxGeometry", { args: [1.6, 0.55, 2.6] }), _jsx("meshStandardMaterial", { color: "#d8392a", roughness: 0.5 })] }), _jsxs("mesh", { castShadow: true, position: [0, 0.85, -0.25], children: [_jsx("boxGeometry", { args: [1.3, 0.5, 1.4] }), _jsx("meshStandardMaterial", { color: "#1d2233", roughness: 0.3, metalness: 0.4 })] }), [
                [-0.85, 0.3, 0.95],
                [0.85, 0.3, 0.95],
                [-0.85, 0.3, -0.95],
                [0.85, 0.3, -0.95],
            ].map((p, i) => (_jsxs("mesh", { castShadow: true, position: p, rotation: [0, 0, Math.PI / 2], children: [_jsx("cylinderGeometry", { args: [0.3, 0.3, 0.25, 16] }), _jsx("meshStandardMaterial", { color: "#111", roughness: 0.9 })] }, i)))] }));
}
