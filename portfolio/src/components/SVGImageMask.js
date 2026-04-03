import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function SVGImageMask({ image, maskId, filterId, className, }) {
    return (_jsxs("svg", { className: className || "svg-project-img", width: "1000", height: "600", viewBox: "0 0 1000 600", xmlns: "http://www.w3.org/2000/svg", children: [_jsxs("defs", { children: [_jsxs("filter", { id: filterId, children: [_jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.03", numOctaves: "13", result: "noise" }), _jsx("feDisplacementMap", { in: "SourceGraphic", in2: "noise", scale: "60", xChannelSelector: "R", yChannelSelector: "G" })] }), _jsx("mask", { id: maskId, children: _jsx("circle", { cx: "50%", cy: "50%", r: "0", fill: "white", className: `mask-circle ${maskId}` }) })] }), _jsx("image", { href: image, width: "1000", height: "600", mask: `url(#${maskId})`, style: {
                    filter: "brightness(120%)",
                    transform: "scale(1.05)",
                } })] }));
}
