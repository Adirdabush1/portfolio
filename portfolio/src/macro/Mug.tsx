import { useMemo, useRef } from "react";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group } from "three";
import type { Vector3Tuple } from "three";

interface MugProps {
  position?: Vector3Tuple;
}

const HEIGHT = 1.6;
const RADIUS = 0.8;

interface SteamParticle {
  ref: { current: Mesh | null };
  phase: number;
  speed: number;
  x: number;
}

function SteamCloud() {
  const group = useRef<Group>(null);
  const particles = useMemo<SteamParticle[]>(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        ref: { current: null as Mesh | null },
        phase: i * 0.7,
        speed: 0.5 + Math.random() * 0.4,
        x: (Math.random() - 0.5) * 0.6,
      })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (const p of particles) {
      const m = p.ref.current;
      if (!m) continue;
      const cycle = ((t * p.speed + p.phase) % 3) / 3; // 0..1
      const y = HEIGHT + 0.15 + cycle * 1.4;
      const opacity = (1 - cycle) * 0.55;
      const s = 0.18 + cycle * 0.4;
      m.position.set(p.x + Math.sin(t + p.phase) * 0.12, y, Math.cos(t * 0.7 + p.phase) * 0.12);
      m.scale.set(s, s, s);
      const mat = m.material as { opacity: number; transparent: boolean };
      mat.opacity = opacity;
      mat.transparent = true;
    }
  });

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            p.ref.current = el;
          }}
        >
          <sphereGeometry args={[0.45, 12, 8]} />
          <meshStandardMaterial color="#fff" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function Mug({ position = [11, 0, -2] }: MugProps) {
  return (
    <group position={position}>
      {/* Body */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[HEIGHT / 2, RADIUS]} position={[0, HEIGHT / 2, 0]} />
        <mesh castShadow receiveShadow position={[0, HEIGHT / 2, 0]}>
          <cylinderGeometry args={[RADIUS, RADIUS * 0.95, HEIGHT, 32]} />
          <meshStandardMaterial color="#f5f1e8" roughness={0.55} />
        </mesh>
        {/* Inner cavity (dark to suggest depth) */}
        <mesh position={[0, HEIGHT - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, RADIUS * 0.9, 32]} />
          <meshStandardMaterial color="#3b2410" />
        </mesh>
        {/* Coffee surface */}
        <mesh position={[0, HEIGHT - 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[RADIUS * 0.85, 32]} />
          <meshStandardMaterial color="#5a3520" roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* Handle (torus rotated to face front) */}
      <mesh castShadow position={[RADIUS + 0.06, HEIGHT / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.12, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#f5f1e8" roughness={0.55} />
      </mesh>

      {/* "POCKETPROOF" branded stripe */}
      <mesh position={[0, HEIGHT * 0.45, RADIUS + 0.001]}>
        <planeGeometry args={[1.0, 0.22]} />
        <meshStandardMaterial color="#0c0d10" />
      </mesh>

      {/* Steam */}
      <SteamCloud />
    </group>
  );
}
