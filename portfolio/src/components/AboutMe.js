import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import "./AboutMe.css";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";
gsap.registerPlugin(SplitText);
export default function AboutMe() {
    const textBlockRef = useRef(null);
    useEffect(() => {
        if (!textBlockRef.current)
            return;
        // Only split text inside .text-block, not all <p> tags on the page
        const st = new SplitText(textBlockRef.current.querySelectorAll("p"), {
            type: "chars",
            charsClass: "char",
        });
        st.chars.forEach((c) => {
            const char = c;
            gsap.set(char, { attr: { "data-content": char.innerHTML } });
        });
        // Disable the expensive pointer effect on touch devices (mobile)
        const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
        if (isTouchDevice)
            return;
        let rafId = null;
        const handlePointerMove = (e) => {
            if (rafId !== null)
                return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                st.chars.forEach((c) => {
                    var _a;
                    const char = c;
                    const rect = char.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dx = e.clientX - cx;
                    const dy = e.clientY - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100)
                        gsap.to(char, {
                            overwrite: true,
                            duration: 1.2 - dist / 100,
                            scrambleText: {
                                text: (_a = char.dataset.content) !== null && _a !== void 0 ? _a : "",
                                chars: ".:",
                                speed: 0.5,
                            },
                            ease: "none",
                        });
                });
            });
        };
        textBlockRef.current.addEventListener("pointermove", handlePointerMove);
        const el = textBlockRef.current;
        return () => {
            el.removeEventListener("pointermove", handlePointerMove);
            if (rafId !== null)
                cancelAnimationFrame(rafId);
        };
    }, []);
    return (_jsxs("section", { className: "about-section", children: [_jsx("h1", { className: "spotlight-heading", "data-text": "About Me", children: "About Me" }), _jsxs("div", { className: "text-block", ref: textBlockRef, children: [_jsxs("p", { children: ["I'm a self-driven developer who doesn't wait for instructions to start building. Beyond my formal studies in full-stack development, I took it upon myself to master ", _jsx("strong", { children: "TypeScript" }), " and ", _jsx("strong", { children: "NestJS" }), "\u2014learning them from scratch and applying them in real backend projects with real users."] }), _jsxs("p", { children: ["I designed and built structured APIs, implemented ", _jsx("strong", { children: "JWT authentication" }), ", and connected external ", _jsx("strong", { children: "LLM APIs" }), " to create intelligent systems\u2014like a smart chat app that analyzes tone, filters content, and sends alerts automatically."] }), _jsx("p", { children: "For me, coding isn\u2019t just about completing assignments\u2014it's about solving real problems, staying curious, and building things that actually work. That mindset is what I bring to every team I join." })] })] }));
}
