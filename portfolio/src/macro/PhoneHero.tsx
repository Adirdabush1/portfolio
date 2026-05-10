import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { Vector3Tuple } from "three";

interface PhoneHeroProps {
  position?: Vector3Tuple;
  rotationY?: number;
}

const PHONE_W = 3.5;
const PHONE_D = 7;
const PHONE_H = 0.35;

export default function PhoneHero({
  position = [6, 0.6, -2],
  rotationY = -0.25,
}: PhoneHeroProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[PHONE_W / 2, PHONE_H / 2, PHONE_D / 2]} />
        {/* Phone body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[PHONE_W, PHONE_H, PHONE_D]} />
          <meshStandardMaterial color="#0d0e12" roughness={0.45} metalness={0.7} />
        </mesh>
        {/* Screen surface (slightly raised) */}
        <mesh position={[0, PHONE_H / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[PHONE_W * 0.92, PHONE_D * 0.92]} />
          <meshStandardMaterial color="#0a0b0f" roughness={0.05} metalness={0} />
        </mesh>
        {/* Screen rim (a thin bezel via inset darker frame) */}
        <mesh position={[0, PHONE_H / 2 + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[PHONE_W * 0.42, PHONE_W * 0.46, 4]} />
          <meshStandardMaterial color="#15161a" />
        </mesh>
      </RigidBody>

      {/* HTML UI projected on phone screen */}
      <Html
        transform
        occlude="blending"
        position={[0, PHONE_H / 2 + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        distanceFactor={4.5}
        style={{
          width: 360,
          height: 720,
          borderRadius: 36,
          overflow: "hidden",
          padding: 0,
          background: "linear-gradient(180deg, #0a1322 0%, #1a0f25 100%)",
          color: "#fff",
          fontFamily: "Poppins, system-ui, sans-serif",
          boxShadow: "inset 0 0 40px rgba(255,255,255,0.05)",
          userSelect: "none",
        }}
      >
        <div style={{ padding: 22, height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75 }}>
            <span>9:41</span>
            <span>•••</span>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, opacity: 0.65, letterSpacing: 1.2, textTransform: "uppercase" }}>
              PocketProof
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 6 }}>
              Field docs for teams in motion.
            </div>
          </div>

          <div
            style={{
              marginTop: 6,
              padding: 18,
              borderRadius: 22,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>Today's report</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Site B-204 — Inspection</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Signed · Synced · Audit-ready</div>
            <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 64,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, rgba(85,165,254,${0.3 + i * 0.15}), rgba(204,95,184,${0.3 + i * 0.15}))`,
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <button
            style={{
              padding: "14px 18px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(315deg, #55A5FE, #A469FF, #CC5FB8)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.open("https://github.com/adirdabush", "_blank");
            }}
          >
            View case study →
          </button>
          <div style={{ fontSize: 11, opacity: 0.5, textAlign: "center" }}>
            Built by Adir Dabush
          </div>
        </div>
      </Html>
    </group>
  );
}
