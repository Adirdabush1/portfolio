import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, CanvasTexture, Vector3 } from "three";
const NOTE_W = 1.3;
const NOTE_T = 0.04;
const AVATAR_SCALE = 0.22;
function makeNote(text) {
    const w = 512;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#bce8ff";
    ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,0.2)");
    grad.addColorStop(1, "rgba(0,0,0,0.1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(20,20,30,0.85)";
    ctx.font = "bold 64px 'Caveat', 'Comic Sans MS', cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h - 90);
    ctx.font = "bold 80px sans-serif";
    ctx.fillText("↑", w / 2, h - 200);
    return new CanvasTexture(canvas);
}
function Avatar() {
    const groupRef = useRef(null);
    const gltf = useGLTF("/avatar.glb");
    const offsetY = useRef(0);
    useEffect(() => {
        gltf.scene.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        // Compute model bounding box at unit scale to lift it so its lowest
        // point sits at y=0 (i.e., flush with the note surface, no burial).
        const box = new Box3().setFromObject(gltf.scene);
        const size = new Vector3();
        box.getSize(size);
        // box.min.y is the y-offset of the model's lowest point in its local space.
        offsetY.current = -box.min.y;
    }, [gltf]);
    return (_jsx("primitive", { ref: groupRef, object: gltf.scene, scale: [AVATAR_SCALE, AVATAR_SCALE, AVATAR_SCALE], position: [0, NOTE_T + 0.005 + offsetY.current * AVATAR_SCALE, 0] }));
}
function FallbackBust() {
    return (_jsxs("group", { position: [0, NOTE_T + 0.05, 0], children: [_jsxs("mesh", { castShadow: true, position: [0, 0.25, 0], children: [_jsx("sphereGeometry", { args: [0.12, 16, 12] }), _jsx("meshStandardMaterial", { color: "#e8c5a0", roughness: 0.7 })] }), _jsxs("mesh", { castShadow: true, position: [0, 0.08, 0], children: [_jsx("cylinderGeometry", { args: [0.09, 0.12, 0.18, 12] }), _jsx("meshStandardMaterial", { color: "#3a4252", roughness: 0.7 })] })] }));
}
export default function AvatarPedestal({ position, rotationY }) {
    const tex = useMemo(() => makeNote("this is me"), []);
    return (_jsxs("group", { position: position, rotation: [0, rotationY, 0], children: [_jsxs("mesh", { castShadow: true, receiveShadow: true, position: [0, NOTE_T / 2, 0], children: [_jsx("boxGeometry", { args: [NOTE_W, NOTE_T, NOTE_W] }), _jsx("meshStandardMaterial", { color: "#bce8ff", roughness: 0.95 })] }), _jsxs("mesh", { position: [0, NOTE_T + 0.001, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("planeGeometry", { args: [NOTE_W * 0.96, NOTE_W * 0.96] }), _jsx("meshStandardMaterial", { map: tex, transparent: true })] }), _jsx(Suspense, { fallback: _jsx(FallbackBust, {}), children: _jsx(Avatar, {}) })] }));
}
useGLTF.preload("/avatar.glb");
