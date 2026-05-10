import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { Vector3Tuple } from "three";

interface MonitorHeroProps {
  position?: Vector3Tuple;
  rotationY?: number;
}

const SCREEN_W = 3.6;
const SCREEN_H = 2.2;
const SCREEN_T = 0.12;
const NECK_H = 1.4;

const NAV_ITEMS = ["Home", "Dashboard", "Practice", "Profile", "Logout"];

const screenStyles: React.CSSProperties = {
  width: 1280,
  height: 760,
  borderRadius: 22,
  overflow: "hidden",
  background: "radial-gradient(ellipse at top, #14151a 0%, #050507 70%)",
  color: "#0c0d10",
  fontFamily: "Poppins, system-ui, sans-serif",
  position: "relative",
  userSelect: "none",
};

const innerPanel: React.CSSProperties = {
  position: "absolute",
  inset: "8% 4% 4% 4%",
  borderRadius: 28,
  background: "#dadde2",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: 40,
  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
};

const navPill: React.CSSProperties = {
  background: "#e9ecef",
  borderRadius: 999,
  padding: "18px 44px",
  display: "flex",
  gap: 80,
  fontWeight: 700,
  fontSize: 22,
  color: "#0c0d10",
  letterSpacing: 0.3,
  marginBottom: 50,
};

const titleStyle: React.CSSProperties = {
  fontSize: 78,
  fontWeight: 800,
  color: "#1a1c20",
  letterSpacing: -1,
  textAlign: "center",
  marginTop: "auto",
  marginBottom: "auto",
};

function StarDots() {
  // Procedural star field over the dark area outside the inner panel
  const dots = Array.from({ length: 60 }, (_, i) => {
    const r = (i * 9301 + 49297) % 233280;
    const x = (r % 100);
    const y = (Math.floor(r / 100) % 100);
    const size = 1 + ((i * 7) % 3);
    const opacity = 0.25 + ((i * 13) % 60) / 100;
    return (
      <span
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#a3a8b2",
          opacity,
          pointerEvents: "none",
        }}
      />
    );
  });
  return <>{dots}</>;
}

export default function MonitorHero({
  position = [4.5, 0.3, -5],
  rotationY = -0.3,
}: MonitorHeroProps) {
  const baseY = 0.07;
  const neckBottom = baseY + 0.07; // top of base
  const screenBottom = neckBottom + NECK_H;
  const screenCenterY = screenBottom + SCREEN_H / 2;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stand base on the desk */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.6, 0.07, 0.45]} position={[0, baseY, 0]} />
        <mesh castShadow position={[0, baseY, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 0.14, 24]} />
          <meshStandardMaterial color="#16171c" roughness={0.4} metalness={0.6} />
        </mesh>
      </RigidBody>

      {/* Vertical neck */}
      <mesh castShadow position={[0, neckBottom + NECK_H / 2, 0]}>
        <boxGeometry args={[0.18, NECK_H, 0.18]} />
        <meshStandardMaterial color="#16171c" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Screen panel — standing upright */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[SCREEN_W / 2, SCREEN_H / 2, SCREEN_T / 2]}
          position={[0, screenCenterY, 0]}
        />
        <mesh castShadow position={[0, screenCenterY, 0]}>
          <boxGeometry args={[SCREEN_W, SCREEN_H, SCREEN_T]} />
          <meshStandardMaterial color="#0a0b0e" roughness={0.55} metalness={0.6} />
        </mesh>
        <mesh position={[0, screenCenterY, SCREEN_T / 2 + 0.001]}>
          <planeGeometry args={[SCREEN_W * 0.97, SCREEN_H * 0.95]} />
          <meshStandardMaterial color="#16171c" roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* HTML overlay — the AI Mentor mockup, rendered on the front face */}
      <Html
        transform
        occlude="blending"
        position={[0, screenCenterY, SCREEN_T / 2 + 0.02]}
        distanceFactor={2.4}
      >
        <div style={screenStyles}>
          <StarDots />
          <div style={innerPanel}>
            <div style={navPill}>
              {NAV_ITEMS.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div style={titleStyle}>Learn With Your AI Mentor</div>
          </div>
        </div>
      </Html>

      {/* Subtle blue glow strip under the bezel */}
      <mesh position={[0, screenBottom, 0.09]}>
        <boxGeometry args={[SCREEN_W * 0.5, 0.04, 0.03]} />
        <meshStandardMaterial
          color="#55A5FE"
          emissive="#55A5FE"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
