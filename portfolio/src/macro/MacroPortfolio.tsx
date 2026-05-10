import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useNavigate } from "react-router-dom";
import { PerspectiveCamera, Environment } from "@react-three/drei";

import Desk from "./Desk";
import ToyCar, { type ToyCarHandle } from "./ToyCar";
import Lamp from "./Lamp";
import MonitorHero from "./MonitorHero";
import Keyboard from "./Keyboard";
import Mug from "./Mug";
import Plant from "./Plant";
import Laptop from "./Laptop";
import StickyNotes from "./StickyNotes";
import AvatarPedestal from "./AvatarPedestal";
import CableHighway from "./CableHighway";
import HUD from "./HUD";
import LoadingScreen from "../three/LoadingScreen";
import MobileJoystick from "../drive/MobileJoystick";
import { isTouchDevice } from "../drive/touch";
import { PROPS } from "./constants";

export default function MacroPortfolio() {
  const navigate = useNavigate();
  const carRef = useRef<ToyCarHandle>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [touchMode] = useState(isTouchDevice);

  useEffect(() => {
    if (loaded) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 18);
        if (next >= 100) clearInterval(id);
        return next;
      });
    }, 120);
    return () => clearInterval(id);
  }, [loaded]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#050507", overflow: "hidden" }}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <PerspectiveCamera makeDefault fov={45} position={[0, 4, 10]} near={0.1} far={120} />
        <color attach="background" args={["#050507"]} />
        <fog attach="fog" args={["#050507", 18, 55]} />
        <ambientLight intensity={0.18} />
        <hemisphereLight args={["#3d4a6a", "#0a0a0d", 0.25]} />
        <Suspense fallback={null}>
          <Environment preset="apartment" background={false} />
        </Suspense>
        <Suspense fallback={null}>
          <Physics gravity={[0, -16, 0]}>
            <Desk />
            <Lamp />
            <Keyboard />
            <MonitorHero />
            <Mug position={PROPS.MUG} />
            <Plant position={PROPS.PLANT} />
            <Laptop position={PROPS.LAPTOP} />
            <StickyNotes
              notes={PROPS.STICKY_NOTES.map((n) => ({
                position: n.pos,
                rotationY: n.rotY,
                color: n.color,
                text: n.text,
              }))}
            />
            <AvatarPedestal position={PROPS.AVATAR_NOTE.pos} rotationY={PROPS.AVATAR_NOTE.rotY} />
            <CableHighway carRef={carRef} />
            <ToyCar ref={carRef} />
          </Physics>
        </Suspense>
      </Canvas>

      <HUD
        onClassic={() => navigate("/classic")}
        onDriveCity={() => navigate("/drive")}
      />
      {touchMode && <MobileJoystick />}

      {!loaded && (
        <LoadingScreen
          progress={progress}
          onComplete={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
