import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { CanvasTexture } from "three";
function makeNoteTexture(text, color) {
    const w = 512;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    // base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    // soft shading at edges
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,0.18)");
    grad.addColorStop(0.5, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // crumple lines
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * w, Math.random() * h);
        ctx.lineTo(Math.random() * w, Math.random() * h);
        ctx.stroke();
    }
    // handwritten-style text
    ctx.fillStyle = "rgba(20,20,30,0.85)";
    ctx.font = "bold 56px 'Caveat', 'Comic Sans MS', cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // wrap if long
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width < w - 100) {
            line = test;
        }
        else {
            lines.push(line);
            line = word;
        }
    }
    if (line)
        lines.push(line);
    const lh = 70;
    const startY = h / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => ctx.fillText(l, w / 2, startY + i * lh));
    return new CanvasTexture(canvas);
}
function Note({ position, rotationY, color, text }) {
    const tex = useMemo(() => makeNoteTexture(text, color), [text, color]);
    return (_jsxs("group", { position: position, rotation: [0, rotationY, 0], children: [_jsxs("mesh", { castShadow: true, receiveShadow: true, position: [0, 0.025, 0], children: [_jsx("boxGeometry", { args: [1.0, 0.04, 1.0] }), _jsx("meshStandardMaterial", { color: color, roughness: 0.95 })] }), _jsxs("mesh", { position: [0, 0.046, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("planeGeometry", { args: [0.96, 0.96] }), _jsx("meshStandardMaterial", { map: tex, transparent: true })] })] }));
}
export default function StickyNotes({ notes }) {
    return (_jsx(_Fragment, { children: notes.map((n, i) => (_jsx(Note, Object.assign({}, n), i))) }));
}
