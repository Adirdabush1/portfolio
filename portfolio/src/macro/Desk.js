import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { DESK } from "./constants";
function makeWoodTexture() {
    const w = 1024;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    // base wood color
    ctx.fillStyle = DESK.WOOD;
    ctx.fillRect(0, 0, w, h);
    // horizontal grain stripes
    for (let i = 0; i < 80; i++) {
        const y = Math.random() * h;
        const len = 200 + Math.random() * 600;
        const x = Math.random() * w - 200;
        const alpha = 0.05 + Math.random() * 0.15;
        ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
        ctx.lineWidth = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + len * 0.3, y + (Math.random() - 0.5) * 4, x + len * 0.6, y + (Math.random() - 0.5) * 4, x + len, y + (Math.random() - 0.5) * 6);
        ctx.stroke();
    }
    // knots
    for (let i = 0; i < 6; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const r = 4 + Math.random() * 10;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, DESK.WOOD_DARK);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }
    // soft shading
    const noise = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < noise.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 12;
        noise.data[i] += n;
        noise.data[i + 1] += n * 0.7;
        noise.data[i + 2] += n * 0.4;
    }
    ctx.putImageData(noise, 0, 0);
    const tex = new CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
}
export default function Desk() {
    const tex = useMemo(makeWoodTexture, []);
    return (_jsxs(_Fragment, { children: [_jsxs(RigidBody, { type: "fixed", colliders: false, position: [0, -8, 0], children: [_jsx(CuboidCollider, { args: [200, 0.5, 200] }), _jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], receiveShadow: true, children: [_jsx("planeGeometry", { args: [400, 400] }), _jsx("meshStandardMaterial", { color: "#0e0e10", roughness: 0.95 })] })] }), _jsxs(RigidBody, { type: "fixed", colliders: false, position: [0, DESK.HEIGHT, 0], children: [_jsx(CuboidCollider, { args: [DESK.WIDTH / 2, DESK.THICKNESS / 2, DESK.DEPTH / 2] }), _jsxs("mesh", { receiveShadow: true, castShadow: true, children: [_jsx("boxGeometry", { args: [DESK.WIDTH, DESK.THICKNESS, DESK.DEPTH] }), _jsx("meshStandardMaterial", { map: tex, roughness: 0.7, metalness: 0.05 })] })] }), _jsxs("mesh", { position: [0, DESK.THICKNESS / 2 + 0.04, DESK.DEPTH / 2 - 0.05], castShadow: true, children: [_jsx("boxGeometry", { args: [DESK.WIDTH, 0.08, 0.1] }), _jsx("meshStandardMaterial", { color: DESK.EDGE })] }), _jsxs("mesh", { position: [0, DESK.THICKNESS / 2 + 0.04, -(DESK.DEPTH / 2 - 0.05)], castShadow: true, children: [_jsx("boxGeometry", { args: [DESK.WIDTH, 0.08, 0.1] }), _jsx("meshStandardMaterial", { color: DESK.EDGE })] }), _jsxs("mesh", { position: [DESK.WIDTH / 2 - 0.05, DESK.THICKNESS / 2 + 0.04, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [0.1, 0.08, DESK.DEPTH] }), _jsx("meshStandardMaterial", { color: DESK.EDGE })] }), _jsxs("mesh", { position: [-(DESK.WIDTH / 2 - 0.05), DESK.THICKNESS / 2 + 0.04, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [0.1, 0.08, DESK.DEPTH] }), _jsx("meshStandardMaterial", { color: DESK.EDGE })] }), [
                [-DESK.WIDTH / 2 + 0.6, -3.6, -DESK.DEPTH / 2 + 0.6],
                [DESK.WIDTH / 2 - 0.6, -3.6, -DESK.DEPTH / 2 + 0.6],
                [-DESK.WIDTH / 2 + 0.6, -3.6, DESK.DEPTH / 2 - 0.6],
                [DESK.WIDTH / 2 - 0.6, -3.6, DESK.DEPTH / 2 - 0.6],
            ].map((p, i) => (_jsxs("mesh", { position: p, castShadow: true, children: [_jsx("boxGeometry", { args: [0.5, 7, 0.5] }), _jsx("meshStandardMaterial", { color: DESK.WOOD_DARK, roughness: 0.7 })] }, i)))] }));
}
