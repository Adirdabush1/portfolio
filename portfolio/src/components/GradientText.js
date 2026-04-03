import { jsx as _jsx } from "react/jsx-runtime";
import "./GradientText.css";
export default function GradientText({ children, className = "", colors = ["#40ffaa", "#4079ff", "#a155ff", "#40ffaa"], animationSpeed = 4, }) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        animationDuration: `${animationSpeed}s`,
    };
    return (_jsx("div", { className: `animated-gradient-text ${className}`, children: _jsx("div", { className: "text-content", style: gradientStyle, children: children }) }));
}
