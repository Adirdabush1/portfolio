import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { Vector3Tuple } from "three";

interface LaptopProps {
  position?: Vector3Tuple;
  rotationY?: number;
}

const BASE_W = 3.6;
const BASE_D = 2.5;
const BASE_T = 0.12;
const SCREEN_TILT = 1.92; // ~110° open

const codeStyle: React.CSSProperties = {
  width: 920,
  height: 580,
  background: "#0d1117",
  color: "#c9d1d9",
  fontFamily: "JetBrains Mono, ui-monospace, monospace",
  fontSize: 22,
  lineHeight: 1.5,
  padding: "28px 36px",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const titleBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 18,
  paddingBottom: 14,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const dot = (c: string): React.CSSProperties => ({
  width: 14,
  height: 14,
  borderRadius: 14,
  background: c,
});

const C = {
  kw: "#ff7b72",
  fn: "#d2a8ff",
  str: "#a5d6ff",
  num: "#79c0ff",
  com: "#8b949e",
  pun: "#c9d1d9",
};

export default function Laptop({
  position = [-3.2, 0.3, -5.5],
  rotationY = 0.18,
}: LaptopProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Base (keyboard half) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[BASE_W / 2, BASE_T / 2, BASE_D / 2]} position={[0, BASE_T / 2, 0]} />
        <mesh castShadow receiveShadow position={[0, BASE_T / 2, 0]}>
          <boxGeometry args={[BASE_W, BASE_T, BASE_D]} />
          <meshStandardMaterial color="#2a2c33" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Trackpad hint */}
        <mesh position={[0, BASE_T + 0.005, BASE_D * 0.25]}>
          <boxGeometry args={[BASE_W * 0.4, 0.005, BASE_D * 0.32]} />
          <meshStandardMaterial color="#1a1c20" roughness={0.3} />
        </mesh>
      </RigidBody>

      {/* Screen lid (tilted up) */}
      <group position={[0, BASE_T, -BASE_D / 2]} rotation={[-SCREEN_TILT + Math.PI / 2, 0, 0]}>
        <mesh castShadow position={[0, BASE_D / 2, 0]}>
          <boxGeometry args={[BASE_W, BASE_D, 0.08]} />
          <meshStandardMaterial color="#16171c" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Screen face */}
        <mesh position={[0, BASE_D / 2, 0.043]}>
          <planeGeometry args={[BASE_W * 0.93, BASE_D * 0.88]} />
          <meshStandardMaterial color="#0d1117" emissive="#0d1117" emissiveIntensity={0.4} />
        </mesh>

        {/* HTML overlay with code */}
        <Html
          transform
          occlude="blending"
          position={[0, BASE_D / 2, 0.05]}
          distanceFactor={2.6}
        >
          <div style={codeStyle}>
            <div style={titleBar}>
              <span style={dot("#ff5f56")} />
              <span style={dot("#ffbd2e")} />
              <span style={dot("#27c93f")} />
              <span style={{ marginLeft: 14, fontSize: 14, opacity: 0.7 }}>
                ~/portfolio/macro/ToyCar.tsx
              </span>
            </div>

            <div>
              <span style={{ color: C.com }}>// drive Adir's desk</span>
            </div>
            <div>
              <span style={{ color: C.kw }}>const</span>{" "}
              <span style={{ color: C.fn }}>useDrive</span> ={" "}
              <span style={{ color: C.kw }}>(</span>
              <span style={{ color: C.pun }}>body</span>
              <span style={{ color: C.kw }}>)</span>{" "}
              <span style={{ color: C.kw }}>=&gt;</span>{" "}
              {"{"}
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: C.kw }}>const</span> keys ={" "}
              <span style={{ color: C.fn }}>useKeyboard</span>
              <span style={{ color: C.pun }}>()</span>;
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: C.fn }}>useFrame</span>
              <span style={{ color: C.pun }}>((_, dt) =&gt; {`{`}</span>
            </div>
            <div style={{ paddingLeft: 56 }}>
              <span style={{ color: C.kw }}>if</span>{" "}
              <span style={{ color: C.pun }}>(keys.forward)</span>
            </div>
            <div style={{ paddingLeft: 84 }}>
              body.<span style={{ color: C.fn }}>applyImpulse</span>
              {`(`}
              {"{"}
              y:{" "}
              <span style={{ color: C.num }}>0</span>, z:{" "}
              <span style={{ color: C.num }}>-ACCEL</span> {"}"}
              {`)`};
            </div>
            <div style={{ paddingLeft: 56 }}>
              <span style={{ color: C.kw }}>if</span>{" "}
              <span style={{ color: C.pun }}>(keys.bounce)</span>
            </div>
            <div style={{ paddingLeft: 84 }}>
              <span style={{ color: C.fn }}>hop</span>
              <span style={{ color: C.pun }}>(body)</span>;{" "}
              <span style={{ color: C.com }}>// 🐰</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: C.pun }}>{"});"}</span>
            </div>
            <div>{"}"};</div>
            <div style={{ marginTop: 12 }}>
              <span style={{ color: C.com }}>// adir.dev — built with three.js + rapier</span>
            </div>

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.5, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span>main *  +12 -3</span>
              <span>UTF-8  ·  TypeScript React</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}
