import { jsx as _jsx } from "react/jsx-runtime";
import "./useScrollAnimation.css";
export default function UseScrollAnimation() {
    const colors = [
        "#121212",
        "#1a1a1a",
        "#222222",
        "#2a2a2a",
        "#333333",
        "#3b3b3b",
    ];
    return (_jsx("div", { className: "jelly-scroll", children: colors.map((color, index) => (_jsx("div", { className: "snap-section", style: { backgroundColor: color }, "aria-label": `Background color ${color}`, role: "presentation" }, index))) }));
}
