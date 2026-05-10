import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { CameraPath } from "./CameraPath";
import { HeroBrain } from "./sections/HeroBrain";
import { SkillsNetwork } from "./sections/SkillsNetwork";
import { DataStream } from "./sections/DataStream";
import { SoundWaves } from "./sections/SoundWaves";
import { SpotlightMist } from "./sections/SpotlightMist";
import { ProjectCarousel } from "./sections/ProjectCarousel";
import { AiCore } from "./sections/AiCore";
import { Convergence } from "./sections/Convergence";
import { SectionTitle } from "./sections/SectionTitle";
import { isMobile, getPixelRatio } from "./utils/responsive";
import LoadingScreen from "./LoadingScreen";
gsap.registerPlugin(ScrollTrigger);
// Section scroll ranges (normalized 0-1)
const SECTIONS = {
    hero: { start: 0.00, end: 0.20 },
    skills: { start: 0.20, end: 0.35 },
    aboutScroll: { start: 0.35, end: 0.45 },
    audio: { start: 0.45, end: 0.50 },
    aboutDetail: { start: 0.50, end: 0.60 },
    projects: { start: 0.60, end: 0.75 },
    ai: { start: 0.75, end: 0.85 },
    contact: { start: 0.85, end: 1.00 },
};
function sectionProgress(globalProgress, section) {
    if (globalProgress < section.start)
        return 0;
    if (globalProgress > section.end)
        return 1;
    return (globalProgress - section.start) / (section.end - section.start);
}
export default function SceneManager() {
    const canvasRef = useRef(null);
    const scrollProgressRef = useRef(0);
    const sectionsRef = useRef({});
    const titlesRef = useRef([]);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraPathRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());
    const rafRef = useRef(0);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        const check = () => setMobile(isMobile());
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    const handleLoadComplete = useCallback(() => {
        window.scrollTo(0, 0);
        scrollProgressRef.current = 0;
        setLoaded(true);
        setTimeout(() => ScrollTrigger.refresh(true), 300);
    }, []);
    useEffect(() => {
        var _a, _b, _c, _d;
        if (mobile || !canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const smallScreen = window.innerWidth < 768;
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: !smallScreen,
            alpha: true,
            powerPreference: "high-performance",
        });
        const initialW = (_b = (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : window.innerWidth;
        const initialH = (_d = (_c = window.visualViewport) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : window.innerHeight;
        renderer.setSize(initialW, initialH, false);
        renderer.setPixelRatio(getPixelRatio());
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        const camera = new THREE.PerspectiveCamera(60, initialW / initialH, 0.1, 100);
        camera.position.set(0, 0, 12);
        cameraRef.current = camera;
        cameraPathRef.current = new CameraPath();
        // Lighting
        scene.add(new THREE.AmbientLight(0x404040, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);
        // Loading simulation
        let progress = 0;
        const loadInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadInterval);
            }
            setLoadingProgress(progress);
        }, 200);
        // Create 3D section titles — floating inside the brain tunnel
        const titles = [
            new SectionTitle("Skills", new THREE.Vector3(0, 2.2, -3), { color: "#61dafb" }),
            new SectionTitle("About Me", new THREE.Vector3(0, 1.8, -9), { color: "#b0bec5" }),
            new SectionTitle("Listen", new THREE.Vector3(0, 1.5, -12), { color: "#4a90d9" }),
            new SectionTitle("About Me", new THREE.Vector3(0, 2, -15), { color: "#efd09e" }),
            new SectionTitle("Projects", new THREE.Vector3(0, 2.5, -19), { color: "#eb8192" }),
            new SectionTitle("AI Assistant", new THREE.Vector3(0, 2.2, -24.5), { color: "#4ec7f3" }),
            new SectionTitle("Contact", new THREE.Vector3(0, 1.8, -29), { color: "#efd09e" }),
        ];
        titles.forEach((t) => scene.add(t.mesh));
        titlesRef.current = titles;
        // Create sections
        const s = sectionsRef.current;
        s.heroBrain = new HeroBrain(scene);
        s.skillsNetwork = new SkillsNetwork(scene);
        s.dataStream = new DataStream(scene);
        s.soundWaves = new SoundWaves(scene);
        s.spotlightMist = new SpotlightMist(scene);
        s.projectCarousel = new ProjectCarousel(scene);
        s.aiCore = new AiCore(scene);
        s.convergence = new Convergence(scene);
        // GSAP ScrollTrigger
        const scrollTrigger = ScrollTrigger.create({
            trigger: "#page-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            onUpdate: (self) => { scrollProgressRef.current = self.progress; },
        });
        // Native scroll fallback for iOS — fires during momentum scroll
        const handleNativeScroll = () => {
            const wrapper = document.getElementById("page-wrapper");
            if (!wrapper)
                return;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = wrapper.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                scrollProgressRef.current = Math.min(Math.max(scrollTop / docHeight, 0), 1);
            }
        };
        window.addEventListener("scroll", handleNativeScroll, { passive: true });
        const handleResize = () => {
            // Prefer visualViewport on mobile so the canvas tracks the URL bar
            const vv = window.visualViewport;
            const w = vv ? vv.width : window.innerWidth;
            const h = vv ? vv.height : window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(getPixelRatio());
            ScrollTrigger.refresh();
        };
        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", handleResize);
            window.visualViewport.addEventListener("scroll", handleResize);
        }
        // Animation loop
        const animate = () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            rafRef.current = requestAnimationFrame(animate);
            const time = clockRef.current.getElapsedTime();
            const p = scrollProgressRef.current;
            // Camera travels INTO the brain
            (_a = cameraPathRef.current) === null || _a === void 0 ? void 0 : _a.update(camera, p);
            // Update section titles based on camera Z
            const camZ = camera.position.z;
            titlesRef.current.forEach((t) => t.update(camZ));
            // Update 3D sections
            const heroP = sectionProgress(p, SECTIONS.hero);
            const skillsP = sectionProgress(p, SECTIONS.skills);
            const aboutScrollP = sectionProgress(p, SECTIONS.aboutScroll);
            const audioP = sectionProgress(p, SECTIONS.audio);
            const aboutDetailP = sectionProgress(p, SECTIONS.aboutDetail);
            const projectsP = sectionProgress(p, SECTIONS.projects);
            const aiP = sectionProgress(p, SECTIONS.ai);
            const contactP = sectionProgress(p, SECTIONS.contact);
            // Hero brain is always active (it's the tunnel)
            (_b = s.heroBrain) === null || _b === void 0 ? void 0 : _b.update(heroP, time);
            if (skillsP > 0 && skillsP <= 1) {
                (_c = s.skillsNetwork) === null || _c === void 0 ? void 0 : _c.update(skillsP, time);
            }
            else {
                (_d = s.skillsNetwork) === null || _d === void 0 ? void 0 : _d.hide();
            }
            if (aboutScrollP > 0 && aboutScrollP <= 1) {
                (_e = s.dataStream) === null || _e === void 0 ? void 0 : _e.update(aboutScrollP, time);
            }
            else {
                (_f = s.dataStream) === null || _f === void 0 ? void 0 : _f.hide();
            }
            if (audioP > 0 && audioP <= 1) {
                (_g = s.soundWaves) === null || _g === void 0 ? void 0 : _g.update(audioP, time);
            }
            else {
                (_h = s.soundWaves) === null || _h === void 0 ? void 0 : _h.hide();
            }
            if (aboutDetailP > 0 && aboutDetailP <= 1) {
                (_j = s.spotlightMist) === null || _j === void 0 ? void 0 : _j.update(aboutDetailP, time);
            }
            else {
                (_k = s.spotlightMist) === null || _k === void 0 ? void 0 : _k.hide();
            }
            if (projectsP > 0 && projectsP <= 1) {
                (_l = s.projectCarousel) === null || _l === void 0 ? void 0 : _l.update(projectsP, time);
            }
            else {
                (_m = s.projectCarousel) === null || _m === void 0 ? void 0 : _m.hide();
            }
            if (aiP > 0 && aiP <= 1) {
                (_o = s.aiCore) === null || _o === void 0 ? void 0 : _o.update(aiP, time);
            }
            else {
                (_p = s.aiCore) === null || _p === void 0 ? void 0 : _p.hide();
            }
            if (contactP > 0 && contactP <= 1) {
                (_q = s.convergence) === null || _q === void 0 ? void 0 : _q.update(contactP, time);
            }
            else {
                (_r = s.convergence) === null || _r === void 0 ? void 0 : _r.hide();
            }
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            clearInterval(loadInterval);
            cancelAnimationFrame(rafRef.current);
            scrollTrigger.kill();
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener("resize", handleResize);
                window.visualViewport.removeEventListener("scroll", handleResize);
            }
            window.removeEventListener("scroll", handleNativeScroll);
            (_a = s.heroBrain) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = s.skillsNetwork) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = s.dataStream) === null || _c === void 0 ? void 0 : _c.dispose();
            (_d = s.soundWaves) === null || _d === void 0 ? void 0 : _d.dispose();
            (_e = s.spotlightMist) === null || _e === void 0 ? void 0 : _e.dispose();
            (_f = s.projectCarousel) === null || _f === void 0 ? void 0 : _f.dispose();
            (_g = s.aiCore) === null || _g === void 0 ? void 0 : _g.dispose();
            (_h = s.convergence) === null || _h === void 0 ? void 0 : _h.dispose();
            titlesRef.current.forEach((t) => t.dispose());
            renderer.dispose();
        };
    }, [mobile]);
    if (mobile)
        return null;
    return (_jsxs(_Fragment, { children: [!loaded && (_jsx(LoadingScreen, { progress: loadingProgress, onComplete: handleLoadComplete })), _jsx("canvas", { ref: canvasRef, style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100dvh",
                    zIndex: 0,
                    pointerEvents: "none",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.5s ease",
                } })] }));
}
