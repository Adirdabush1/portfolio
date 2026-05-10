import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useNavigate } from "react-router-dom";
import { PerspectiveCamera } from "@react-three/drei";

import World from "./World";
import Car, { type CarHandle } from "./Car";
import Billboards from "./Billboards";
import Props from "./Props";
import HUD from "./HUD";
import BillboardModal from "./BillboardModal";
import MobileJoystick from "./MobileJoystick";
import LoadingScreen from "../three/LoadingScreen";
import { isTouchDevice } from "./touch";
import { runTour, stopTour } from "./TourMode";
import { driveStore } from "./useDriveStore";
import { useIsSmall } from "./useIsSmall";

export default function DrivePortfolio() {
  const navigate = useNavigate();
  const carRef = useRef<CarHandle>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [touchMode] = useState(isTouchDevice);
  const small = useIsSmall();

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

  const handleTour = () => {
    const body = carRef.current?.body ?? null;
    if (driveStore.state.tourActive) {
      stopTour(body);
      return;
    }
    if (!body) return;
    runTour(body, () => {});
  };

  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    background: "#0a0f0f",
    overflow: "hidden",
  };

  // Wider FOV on small screens so more world is visible in portrait
  const fov = small ? 70 : 55;

  return (
    <div style={wrapperStyle}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        <PerspectiveCamera makeDefault fov={fov} position={[0, 6, 16]} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -28, 0]}>
            <World />
            <Props carRef={carRef} />
            <Car ref={carRef} />
            <Suspense fallback={null}>
              <Billboards />
            </Suspense>
          </Physics>
        </Suspense>
      </Canvas>

      <HUD onTour={handleTour} onClassic={() => navigate("/classic")} />
      {touchMode && <MobileJoystick />}
      <BillboardModal />

      {!loaded && (
        <LoadingScreen
          progress={progress}
          onComplete={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
