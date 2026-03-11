import React, { useRef, useEffect, useState, useCallback } from "react";
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
  hero:        { start: 0.00, end: 0.20 },
  skills:      { start: 0.20, end: 0.35 },
  aboutScroll: { start: 0.35, end: 0.45 },
  audio:       { start: 0.45, end: 0.50 },
  aboutDetail: { start: 0.50, end: 0.60 },
  projects:    { start: 0.60, end: 0.75 },
  ai:          { start: 0.75, end: 0.85 },
  contact:     { start: 0.85, end: 1.00 },
};

function sectionProgress(globalProgress: number, section: { start: number; end: number }) {
  if (globalProgress < section.start) return 0;
  if (globalProgress > section.end) return 1;
  return (globalProgress - section.start) / (section.end - section.start);
}

export default function SceneManager() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef(0);
  const sectionsRef = useRef<{
    heroBrain?: HeroBrain;
    skillsNetwork?: SkillsNetwork;
    dataStream?: DataStream;
    soundWaves?: SoundWaves;
    spotlightMist?: SpotlightMist;
    projectCarousel?: ProjectCarousel;
    aiCore?: AiCore;
    convergence?: Convergence;
  }>({});
  const titlesRef = useRef<SectionTitle[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraPathRef = useRef<CameraPath | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const rafRef = useRef<number>(0);

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
    // Unlock scroll and reset to top so the hero section doesn't auto-scroll
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, 0);
    scrollProgressRef.current = 0;
    setLoaded(true);
    // Refresh ScrollTrigger after loading — delay more on mobile for layout recalc
    setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 300);
  }, []);

  useEffect(() => {
    if (mobile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(getPixelRatio());
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
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
      if (progress >= 100) { progress = 100; clearInterval(loadInterval); }
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
    // Lock scroll during loading
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const scrollTrigger = ScrollTrigger.create({
      trigger: "#page-wrapper",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => { scrollProgressRef.current = self.progress; },
    });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(getPixelRatio());
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const time = clockRef.current.getElapsedTime();
      const p = scrollProgressRef.current;

      // Camera travels INTO the brain
      cameraPathRef.current?.update(camera, p);

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
      s.heroBrain?.update(heroP, time);

      if (skillsP > 0 && skillsP <= 1) { s.skillsNetwork?.update(skillsP, time); }
      else { s.skillsNetwork?.hide(); }

      if (aboutScrollP > 0 && aboutScrollP <= 1) { s.dataStream?.update(aboutScrollP, time); }
      else { s.dataStream?.hide(); }

      if (audioP > 0 && audioP <= 1) { s.soundWaves?.update(audioP, time); }
      else { s.soundWaves?.hide(); }

      if (aboutDetailP > 0 && aboutDetailP <= 1) { s.spotlightMist?.update(aboutDetailP, time); }
      else { s.spotlightMist?.hide(); }

      if (projectsP > 0 && projectsP <= 1) { s.projectCarousel?.update(projectsP, time); }
      else { s.projectCarousel?.hide(); }

      if (aiP > 0 && aiP <= 1) { s.aiCore?.update(aiP, time); }
      else { s.aiCore?.hide(); }

      if (contactP > 0 && contactP <= 1) { s.convergence?.update(contactP, time); }
      else { s.convergence?.hide(); }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      clearInterval(loadInterval);
      cancelAnimationFrame(rafRef.current);
      scrollTrigger.kill();
      window.removeEventListener("resize", handleResize);

      s.heroBrain?.dispose();
      s.skillsNetwork?.dispose();
      s.dataStream?.dispose();
      s.soundWaves?.dispose();
      s.spotlightMist?.dispose();
      s.projectCarousel?.dispose();
      s.aiCore?.dispose();
      s.convergence?.dispose();
      titlesRef.current.forEach((t) => t.dispose());

      renderer.dispose();
    };
  }, [mobile]);

  if (mobile) return null;

  return (
    <>
      {!loaded && (
        <LoadingScreen progress={loadingProgress} onComplete={handleLoadComplete} />
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
    </>
  );
}
