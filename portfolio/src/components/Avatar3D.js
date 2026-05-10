import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import "./Avatar3D.css";
// Map characters to ARKit morph target combinations
const VISEME_CHARS = {
    a: { jawOpen: 0.25, mouthLowerDownLeft: 0.15, mouthLowerDownRight: 0.15 },
    e: { jawOpen: 0.15, mouthSmileLeft: 0.2, mouthSmileRight: 0.2, mouthLowerDownLeft: 0.1, mouthLowerDownRight: 0.1 },
    i: { jawOpen: 0.12, mouthSmileLeft: 0.25, mouthSmileRight: 0.25 },
    o: { jawOpen: 0.2, mouthFunnel: 0.3, mouthPucker: 0.12 },
    u: { jawOpen: 0.12, mouthPucker: 0.3, mouthFunnel: 0.2 },
    b: { jawOpen: 0.05, mouthPressLeft: 0.4, mouthPressRight: 0.4 },
    m: { jawOpen: 0.03, mouthPressLeft: 0.4, mouthPressRight: 0.4 },
    p: { jawOpen: 0.05, mouthPressLeft: 0.45, mouthPressRight: 0.45 },
    f: { jawOpen: 0.12, mouthLowerDownLeft: 0.2, mouthLowerDownRight: 0.2, mouthUpperUpLeft: 0.15, mouthUpperUpRight: 0.15 },
    v: { jawOpen: 0.12, mouthLowerDownLeft: 0.2, mouthLowerDownRight: 0.2 },
    t: { jawOpen: 0.18, mouthLowerDownLeft: 0.12, mouthLowerDownRight: 0.12 },
    d: { jawOpen: 0.2, mouthLowerDownLeft: 0.12, mouthLowerDownRight: 0.12 },
    s: { jawOpen: 0.12, mouthSmileLeft: 0.2, mouthSmileRight: 0.2, mouthStretchLeft: 0.12, mouthStretchRight: 0.12 },
    z: { jawOpen: 0.15, mouthSmileLeft: 0.2, mouthSmileRight: 0.2 },
    n: { jawOpen: 0.18, mouthLowerDownLeft: 0.08, mouthLowerDownRight: 0.08 },
    l: { jawOpen: 0.22, mouthLowerDownLeft: 0.15, mouthLowerDownRight: 0.15 },
    r: { jawOpen: 0.22, mouthFunnel: 0.15 },
    k: { jawOpen: 0.22, mouthLowerDownLeft: 0.12, mouthLowerDownRight: 0.12 },
    g: { jawOpen: 0.25, mouthLowerDownLeft: 0.12, mouthLowerDownRight: 0.12 },
    w: { jawOpen: 0.18, mouthPucker: 0.45, mouthFunnel: 0.25 },
    y: { jawOpen: 0.2, mouthSmileLeft: 0.25, mouthSmileRight: 0.25 },
    h: { jawOpen: 0.28, mouthLowerDownLeft: 0.12, mouthLowerDownRight: 0.12 },
    th: { jawOpen: 0.15, mouthLowerDownLeft: 0.18, mouthLowerDownRight: 0.18 },
    ch: { jawOpen: 0.18, mouthFunnel: 0.25, mouthSmileLeft: 0.12, mouthSmileRight: 0.12 },
    sh: { jawOpen: 0.15, mouthFunnel: 0.3, mouthPucker: 0.12 },
    " ": {},
};
const MOUTH_CLOSED = {};
const BLINK_INTERVAL = 4;
const BLINK_DURATION = 0.15;
const CHAR_DURATION = 0.12; // Time per character - syncs with speech rate
const LERP_SPEED = 0.25; // Smooth but visible transitions // How fast morphs transition (lower = smoother/slower)
function AvatarModel({ talking, spokenText }) {
    const { scene } = useGLTF("/avatar.glb");
    const meshRef = useRef(null);
    const morphDict = useRef({});
    const visemeQueue = useRef([]);
    const visemeStartTime = useRef(0);
    const targetViseme = useRef({});
    const prevText = useRef("");
    const activeMorphs = useRef(new Set());
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                const mesh = child;
                if (mesh.morphTargetDictionary) {
                    meshRef.current = mesh;
                    morphDict.current = mesh.morphTargetDictionary;
                    mesh.morphTargetInfluences = mesh.morphTargetInfluences ||
                        new Array(Object.keys(mesh.morphTargetDictionary).length).fill(0);
                }
            }
        });
    }, [scene]);
    // Build viseme queue when text changes
    useEffect(() => {
        if (!spokenText || spokenText === prevText.current)
            return;
        prevText.current = spokenText;
        const text = spokenText.toLowerCase().replace(/[^a-z\s]/g, "");
        const queue = [];
        for (let i = 0; i < text.length; i++) {
            const digraph = text.substring(i, i + 2);
            if (VISEME_CHARS[digraph]) {
                queue.push(VISEME_CHARS[digraph]);
                i++;
            }
            else if (VISEME_CHARS[text[i]]) {
                queue.push(VISEME_CHARS[text[i]]);
            }
            else {
                queue.push(MOUTH_CLOSED);
            }
        }
        visemeQueue.current = queue;
        visemeStartTime.current = 0;
    }, [spokenText]);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const mesh = meshRef.current;
        const dict = morphDict.current;
        if (!mesh || !mesh.morphTargetInfluences)
            return;
        // Idle movement
        scene.rotation.y = Math.sin(t * 0.3) * 0.03;
        scene.rotation.x = Math.sin(t * 0.2) * 0.01;
        scene.position.y = Math.sin(t * 0.8) * 0.005;
        // Blink
        const blinkCycle = t % BLINK_INTERVAL;
        const isBlinking = blinkCycle > (BLINK_INTERVAL - BLINK_DURATION);
        if (dict.eyeBlinkLeft !== undefined) {
            mesh.morphTargetInfluences[dict.eyeBlinkLeft] = isBlinking ? 1 : 0;
        }
        if (dict.eyeBlinkRight !== undefined) {
            mesh.morphTargetInfluences[dict.eyeBlinkRight] = isBlinking ? 1 : 0;
        }
        // Text-based lip sync
        if (talking && visemeQueue.current.length > 0) {
            if (visemeStartTime.current === 0) {
                visemeStartTime.current = t;
            }
            const elapsed = t - visemeStartTime.current;
            const charIndex = Math.floor(elapsed / CHAR_DURATION);
            if (charIndex < visemeQueue.current.length) {
                targetViseme.current = visemeQueue.current[charIndex];
            }
            else {
                // Text finished - close mouth, don't loop
                targetViseme.current = MOUTH_CLOSED;
            }
            const target = targetViseme.current;
            // Reset active morphs toward 0
            for (const name of activeMorphs.current) {
                if (dict[name] !== undefined) {
                    const current = mesh.morphTargetInfluences[dict[name]];
                    const goal = target[name] || 0;
                    mesh.morphTargetInfluences[dict[name]] = current + (goal - current) * LERP_SPEED;
                }
            }
            // Apply target morphs
            for (const name of Object.keys(target)) {
                const weight = target[name];
                if (dict[name] !== undefined) {
                    activeMorphs.current.add(name);
                    const current = mesh.morphTargetInfluences[dict[name]];
                    mesh.morphTargetInfluences[dict[name]] = current + (weight - current) * LERP_SPEED;
                }
            }
            // Subtle talking movement
            scene.rotation.y = Math.sin(t * 1.2) * 0.04;
            scene.rotation.x = Math.sin(t * 2) * 0.015;
        }
        else {
            // Ease all mouth morphs to 0
            for (const name of activeMorphs.current) {
                if (dict[name] !== undefined) {
                    const current = mesh.morphTargetInfluences[dict[name]];
                    mesh.morphTargetInfluences[dict[name]] = current * 0.85;
                    if (current < 0.001) {
                        mesh.morphTargetInfluences[dict[name]] = 0;
                    }
                }
            }
            if (!talking && visemeStartTime.current !== 0) {
                visemeStartTime.current = 0;
            }
        }
    });
    useEffect(() => {
        const cube = scene.getObjectByName("Cube");
        if (cube)
            cube.visible = false;
    }, [scene]);
    return _jsx("primitive", { object: scene, scale: 0.55, position: [0, -0.5, 0] });
}
useGLTF.preload("/avatar.glb");
export default function Avatar3D({ talking, spokenText = "" }) {
    return (_jsx("div", { className: `avatar-3d-container ${talking ? "talking" : ""}`, children: _jsxs(Canvas, { camera: { position: [0, 0, 3], fov: 35 }, style: { background: "transparent" }, children: [_jsx("ambientLight", { intensity: 1.2 }), _jsx("directionalLight", { position: [0, 1, 5], intensity: 0.3 }), _jsx("directionalLight", { position: [-2, 0, 4], intensity: 0.2 }), _jsx("directionalLight", { position: [2, 0, 4], intensity: 0.2 }), _jsx(AvatarModel, { talking: talking, spokenText: spokenText })] }) }));
}
