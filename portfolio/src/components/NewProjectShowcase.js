import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "./NewProjectShowcase.css";
import SVGImageMask from "./SVGImageMask";
gsap.registerPlugin(ScrollTrigger);
const projects = [
    {
        title: "CodeMode – Personal Project Showcase",
        link: "https://codemode.onrender.com",
        image: "/CodeMode.png",
        poetry: `A canvas for code, sleek and bright,\nWhere ideas flow and visions ignite,\nProjects come to life in digital light,\nCodeMode shines with creative might.`,
    },
    {
        title: "Samurai Knives Web Project",
        link: "https://github.com/Adirdabush1/samurai-knives-web",
        image: "/samurai1.png",
        poetry: `Shadows cast by the fading light,\nWhispers of steel, a sacred rite,\nHand-forged blades in crimson night,\nA warrior's grace, eternal fight.`,
    },
    {
        title: "RateChat – AI Chat Platform",
        link: "https://github.com/Adirdabush1/RateChat",
        image: "/login ratechat.png",
        poetry: `Voices rise in coded streams,\nWords are weighed in mindful beams,\nA child speaks safe, the system deems,\nRateChat guards their digital dreams.`,
    },
    {
        title: "TimesHub – Time Tracker",
        link: "https://github.com/Adirdabush1/TimesHub",
        image: "/timeshub.png",
        poetry: `Each moment counts, no time to hide,\nA hub where ticking thoughts reside,\nTypeScript binds the future wide,\nTimesHub leads where goals abide.`,
    },
];
export default function NewProjectShowcase() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    useEffect(() => {
        if (isMobile)
            return;
        const triggers = [];
        gsap.utils.toArray(".mask-circle").forEach((circle) => {
            const tween = gsap.to(circle, {
                scrollTrigger: {
                    trigger: circle.closest(".project-section"),
                    start: "top center",
                    end: "bottom center",
                    scrub: true,
                },
                attr: { r: 1000 },
            });
            if (tween.scrollTrigger)
                triggers.push(tween.scrollTrigger);
        });
        return () => {
            triggers.forEach((t) => t.kill());
        };
    }, [isMobile]);
    return (_jsxs("div", { className: "project-showcase", children: [_jsx("section", { className: "intro-section", children: _jsx("h1", { className: "intro-title", children: "Explore My Projects" }) }), projects.map((project, idx) => (_jsxs("section", { className: "project-section", children: [_jsxs("div", { className: "project-text", children: [_jsx("h2", { className: "project-title", children: _jsx("a", { href: project.link, target: "_blank", rel: "noopener noreferrer", className: "project-link", children: project.title }) }), _jsx("p", { className: "project-description", children: project.poetry })] }), _jsx("div", { className: "project-image-wrapper", children: isMobile ? (_jsx("img", { src: project.image, alt: project.title, className: "project-img-mobile" })) : (_jsx(SVGImageMask, { image: project.image, maskId: `mask${idx}`, filterId: `filter${idx}` })) })] }, idx)))] }));
}
