import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import GradientText from "./components/GradientText";
import Navbar from "./components/Navbar";
import AboutMeSection from "./components/AboutMeSection";
import AboutMe from "./components/AboutMe";
import NewProjectShowcase from "./components/NewProjectShowcase";
import AiAssistant from "./components/AiaSSISTANT";
import SkillsSection from "./components/SkillsSection";
import ContactSection from "./components/ContactSection";
import "./HomePage.css";
export default function HomePage() {
    return (_jsxs("div", { id: "page-wrapper", style: { overflowX: "hidden" }, children: [_jsx(Navbar, {}), _jsxs("div", { className: "homepage-container", id: "home", children: [_jsx("svg", { width: "0", height: "0", "aria-hidden": "true", style: { position: 'absolute' }, children: _jsxs("filter", { id: "tear", x: "0", y: "0", width: "100%", height: "100%", children: [_jsx("feTurbulence", { baseFrequency: ".03", numOctaves: "3" }), _jsx("feDisplacementMap", { in: "SourceGraphic", scale: "5", xChannelSelector: "R", yChannelSelector: "G" }), _jsx("feOffset", { dx: "-4", dy: "-4" }), _jsx("feComposite", { in: "SourceGraphic", operator: "atop" })] }) }), _jsxs("div", { className: "hero-content", children: [_jsx("div", { className: "hero-text", children: _jsx(GradientText, { className: "hero-title-inline", animationSpeed: 4, colors: ["#ffffff", "#c0c0c0", "#7f8c8d", "#ffffff"], children: "Hey I'm Adir" }) }), _jsx("img", { src: "/homepage.jpg", alt: "Adir", className: "hero-image puff-in-hor" })] })] }), _jsx("section", { id: "ai-assistant", children: _jsx(AiAssistant, {}) }), _jsx("section", { id: "SkillsSection-section", children: _jsx(SkillsSection, {}) }), _jsx("section", { id: "about-me-section", children: _jsx(AboutMeSection, {}) }), _jsx("section", { id: "about-details", children: _jsx(AboutMe, {}) }), _jsx("section", { id: "projects", children: _jsx(NewProjectShowcase, {}) }), _jsx("section", { id: "contact", children: _jsx(ContactSection, {}) })] }));
}
