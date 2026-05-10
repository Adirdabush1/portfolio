import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { WORLD, ROAD_HALF_WIDTH, PLAZA_RADIUS } from "./constants";
function makeAsphaltTexture() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a1d";
    ctx.fillRect(0, 0, size, size);
    // Coarse asphalt grain
    const noise = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < noise.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 22;
        const m = Math.random() < 0.005 ? 30 : 0; // occasional bright fleck
        noise.data[i] += n + m;
        noise.data[i + 1] += n + m;
        noise.data[i + 2] += n + m;
    }
    ctx.putImageData(noise, 0, 0);
    // Subtle paving seams every quarter, very dark
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= size; x += size / 4) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
    }
    for (let y = 0; y <= size; y += size / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
    }
    const tex = new CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(40, 40);
    tex.anisotropy = 4;
    return tex;
}
function makeRoadStripeTexture(horizontal) {
    // Dashed center line + solid edges, transparent background
    const w = horizontal ? 256 : 128;
    const h = horizontal ? 128 : 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    if (horizontal) {
        // edge stripes (solid white)
        ctx.fillRect(0, 6, w, 3);
        ctx.fillRect(0, h - 9, w, 3);
        // dashed center
        for (let x = 0; x < w; x += 64)
            ctx.fillRect(x, h / 2 - 1.5, 36, 3);
    }
    else {
        ctx.fillRect(6, 0, 3, h);
        ctx.fillRect(w - 9, 0, 3, h);
        for (let y = 0; y < h; y += 64)
            ctx.fillRect(w / 2 - 1.5, y, 3, 36);
    }
    const tex = new CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = RepeatWrapping;
    return tex;
}
function makeCrosswalkTexture() {
    const w = 256;
    const h = 64;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    for (let x = 4; x < w - 8; x += 24) {
        ctx.fillRect(x, 4, 14, h - 8);
    }
    return new CanvasTexture(canvas);
}
function Sky() {
    return (_jsxs("mesh", { scale: [600, 600, 600], children: [_jsx("sphereGeometry", { args: [1, 32, 16] }), _jsx("shaderMaterial", { side: 1, uniforms: {
                    topColor: { value: { r: 0x35 / 255, g: 0x40 / 255, b: 0x70 / 255 } },
                    bottomColor: { value: { r: 0x1c / 255, g: 0x22 / 255, b: 0x2a / 255 } },
                }, vertexShader: `
          varying vec3 vWorld;
          void main() {
            vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `, fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vWorld;
          void main() {
            float h = clamp(normalize(vWorld).y * 0.5 + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
          }
        ` })] }));
}
function RoadStripes({ start, length, horizontal, }) {
    const tex = useMemo(() => makeRoadStripeTexture(horizontal), [horizontal]);
    if (horizontal)
        tex.repeat.set(length / 8, 1);
    else
        tex.repeat.set(1, length / 8);
    return (_jsxs("mesh", { receiveShadow: true, rotation: [-Math.PI / 2, 0, 0], position: [start[0], 0.02, start[2]], children: [_jsx("planeGeometry", { args: horizontal
                    ? [length, ROAD_HALF_WIDTH * 2]
                    : [ROAD_HALF_WIDTH * 2, length] }), _jsx("meshStandardMaterial", { map: tex, transparent: true, roughness: 0.7 })] }));
}
function Crosswalk({ position, rotationY, }) {
    const tex = useMemo(() => makeCrosswalkTexture(), []);
    return (_jsxs("mesh", { receiveShadow: true, rotation: [-Math.PI / 2, 0, rotationY], position: [position[0], 0.025, position[2]], children: [_jsx("planeGeometry", { args: [ROAD_HALF_WIDTH * 2, 3] }), _jsx("meshStandardMaterial", { map: tex, transparent: true })] }));
}
function Roundabout() {
    return (_jsxs(_Fragment, { children: [_jsxs("mesh", { receiveShadow: true, rotation: [-Math.PI / 2, 0, 0], position: [0, 0.025, 0], children: [_jsx("ringGeometry", { args: [PLAZA_RADIUS - 0.6, PLAZA_RADIUS - 0.3, 64] }), _jsx("meshStandardMaterial", { color: "#fff", emissive: "#fff", emissiveIntensity: 0.2 })] }), _jsxs(RigidBody, { type: "fixed", colliders: false, position: [0, 0.15, 0], children: [_jsx(CylinderCollider, { args: [0.15, 3.4] }), _jsxs("mesh", { receiveShadow: true, castShadow: true, children: [_jsx("cylinderGeometry", { args: [3.2, 3.6, 0.3, 24] }), _jsx("meshStandardMaterial", { color: "#22232c", roughness: 0.6 })] })] }), _jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, 0.32, 0], children: [_jsx("ringGeometry", { args: [3.0, 3.2, 24] }), _jsx("meshStandardMaterial", { color: "#fff", emissive: "#fff", emissiveIntensity: 0.5 })] })] }));
}
export default function World() {
    const tex = useMemo(makeAsphaltTexture, []);
    return (_jsxs(_Fragment, { children: [_jsx("ambientLight", { intensity: 0.95 }), _jsx("directionalLight", { position: [40, 60, 20], intensity: 1.6, castShadow: true, "shadow-mapSize-width": 1024, "shadow-mapSize-height": 1024, "shadow-camera-left": -100, "shadow-camera-right": 100, "shadow-camera-top": 100, "shadow-camera-bottom": -100, "shadow-camera-near": 0.1, "shadow-camera-far": 300 }), _jsx("directionalLight", { position: [-30, 40, -20], intensity: 0.6, color: "#aab5d8" }), _jsx("hemisphereLight", { args: ["#a8b5dc", "#3a3d45", 0.85] }), _jsx(Sky, {}), _jsx("fog", { attach: "fog", args: ["#1c222a", 130, 360] }), _jsxs(RigidBody, { type: "fixed", colliders: false, position: [0, 0, 0], children: [_jsxs("mesh", { receiveShadow: true, rotation: [-Math.PI / 2, 0, 0], children: [_jsx("planeGeometry", { args: [WORLD.GROUND_SIZE, WORLD.GROUND_SIZE] }), _jsx("meshStandardMaterial", { map: tex, roughness: 0.95 })] }), _jsx(CuboidCollider, { args: [WORLD.GROUND_SIZE / 2, 0.1, WORLD.GROUND_SIZE / 2], position: [0, -0.1, 0] })] }), _jsx(Roundabout, {}), _jsx(RoadStripes, { start: [0, 0, -100], length: 170, horizontal: false }), _jsx(RoadStripes, { start: [100, 0, 0], length: 170, horizontal: true }), _jsx(RoadStripes, { start: [0, 0, 100], length: 170, horizontal: false }), _jsx(RoadStripes, { start: [-100, 0, 0], length: 170, horizontal: true }), _jsx(Crosswalk, { position: [0, 0, -PLAZA_RADIUS - 2], rotationY: 0 }), _jsx(Crosswalk, { position: [0, 0, PLAZA_RADIUS + 2], rotationY: 0 }), _jsx(Crosswalk, { position: [PLAZA_RADIUS + 2, 0, 0], rotationY: Math.PI / 2 }), _jsx(Crosswalk, { position: [-PLAZA_RADIUS - 2, 0, 0], rotationY: Math.PI / 2 }), _jsx(Crosswalk, { position: [0, 0, -55], rotationY: 0 }), _jsx(Crosswalk, { position: [0, 0, 55], rotationY: 0 }), _jsx(Crosswalk, { position: [55, 0, 0], rotationY: Math.PI / 2 }), _jsx(Crosswalk, { position: [-55, 0, 0], rotationY: Math.PI / 2 }), [
                { pos: [WORLD.GROUND_SIZE / 2, 1, 0], size: [1, 2, WORLD.GROUND_SIZE / 2] },
                { pos: [-WORLD.GROUND_SIZE / 2, 1, 0], size: [1, 2, WORLD.GROUND_SIZE / 2] },
                { pos: [0, 1, WORLD.GROUND_SIZE / 2], size: [WORLD.GROUND_SIZE / 2, 2, 1] },
                { pos: [0, 1, -WORLD.GROUND_SIZE / 2], size: [WORLD.GROUND_SIZE / 2, 2, 1] },
            ].map((w, i) => (_jsx(RigidBody, { type: "fixed", colliders: "cuboid", position: w.pos, children: _jsxs("mesh", { visible: false, children: [_jsx("boxGeometry", { args: w.size }), _jsx("meshStandardMaterial", {})] }) }, i)))] }));
}
