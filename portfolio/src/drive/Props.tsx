import { useRef, type RefObject } from "react";
import { Mesh } from "three";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import type { CarHandle } from "./Car";
import { CAR, PROPS } from "./constants";

interface PropsProps {
  carRef: RefObject<CarHandle | null>;
}

function BowlingPin({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody
      colliders="hull"
      position={position}
      mass={0.4}
      linearDamping={0.6}
      angularDamping={0.4}
      restitution={0.2}
    >
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 0.9, 14]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.08, 14]} />
        <meshStandardMaterial color="#d8392a" />
      </mesh>
    </RigidBody>
  );
}

function Ramp({ position, rot }: { position: [number, number, number]; rot: number }) {
  return (
    <RigidBody type="fixed" colliders="trimesh" position={position} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]} rotation={[0, 0, -Math.PI / 14]}>
        <boxGeometry args={[5.5, 0.3, 4]} />
        <meshStandardMaterial color="#9a9aa0" />
      </mesh>
    </RigidBody>
  );
}

function Cone({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody colliders="hull" position={position} mass={0.2} restitution={0.3}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <coneGeometry args={[0.28, 0.9, 12]} />
        <meshStandardMaterial color="#e87a3a" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.27, 0.05, 8, 14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </RigidBody>
  );
}

function BouncePad({
  position,
  carRef,
}: {
  position: [number, number, number];
  carRef: RefObject<CarHandle | null>;
}) {
  const lastTriggerRef = useRef(0);
  const ringRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    const s = 1 + Math.sin(t * 3 + position[0]) * 0.08;
    ringRef.current.scale.set(s, 1, s);
  });

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider
        args={[1.4, 0.6, 1.4]}
        position={[0, 0.6, 0]}
        sensor
        onIntersectionEnter={({ rigidBody }) => {
          const car = carRef.current?.body;
          if (!car || rigidBody !== car) return;
          const now = performance.now();
          if (now - lastTriggerRef.current < 700) return;
          lastTriggerRef.current = now;
          car.applyImpulse({ x: 0, y: CAR.PAD_BOUNCE_IMPULSE, z: 0 }, true);
        }}
      />
      <mesh receiveShadow castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.1, 24]} />
        <meshStandardMaterial color="#1a1a22" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.25, 1.25, 0.05, 24]} />
        <meshStandardMaterial
          color="#ffd23a"
          emissive="#ffd23a"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.18, 0]}>
        <torusGeometry args={[1.05, 0.06, 8, 24]} />
        <meshStandardMaterial color="#d8392a" emissive="#d8392a" emissiveIntensity={0.4} />
      </mesh>
    </RigidBody>
  );
}

function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.15, 2, 0.15]} position={[0, 2, 0]} />
        <mesh castShadow position={[0, 2, 0]}>
          <cylinderGeometry args={[0.1, 0.13, 4, 10]} />
          <meshStandardMaterial color="#1a1a22" />
        </mesh>
        <mesh position={[0.6, 3.95, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#1a1a22" />
        </mesh>
      </RigidBody>
      <mesh position={[1.1, 3.85, 0]}>
        <boxGeometry args={[0.4, 0.18, 0.4]} />
        <meshStandardMaterial
          color="#ffe6b0"
          emissive="#ffe6b0"
          emissiveIntensity={1.2}
        />
      </mesh>
      <pointLight
        position={[1.1, 3.7, 0]}
        intensity={0.9}
        distance={14}
        color="#ffe6b0"
      />
    </group>
  );
}

function Spire({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[6, 1.8]} position={[0, 6, 0]} />
        <mesh castShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[3.2, 3.6, 1.2, 8]} />
          <meshStandardMaterial color="#22232c" roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 5.5, 0]}>
          <cylinderGeometry args={[1.4, 1.8, 9, 6]} />
          <meshStandardMaterial color="#3a6df0" emissive="#3a6df0" emissiveIntensity={0.25} />
        </mesh>
        <mesh castShadow position={[0, 11.5, 0]}>
          <coneGeometry args={[1.4, 3, 6]} />
          <meshStandardMaterial color="#A469FF" emissive="#A469FF" emissiveIntensity={0.4} />
        </mesh>
      </RigidBody>
      <pointLight position={[0, 13, 0]} intensity={2.4} distance={28} color="#A469FF" />
    </group>
  );
}

function ZonePillar({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 3, 0.6]} />
        <meshStandardMaterial color="#1a1a22" />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
}

export default function Props({ carRef }: PropsProps) {
  return (
    <>
      <Spire position={PROPS.SPIRE} />

      {PROPS.RAMPS.map((r, i) => (
        <Ramp key={`ramp-${i}`} position={r.pos} rot={r.rot} />
      ))}

      {PROPS.BOWLING_PINS.map((p, i) => (
        <BowlingPin key={`pin-${i}`} position={p} />
      ))}

      {PROPS.CONES.map((p, i) => (
        <Cone key={`cone-${i}`} position={p} />
      ))}

      {PROPS.BOUNCE_PADS.map((p, i) => (
        <BouncePad key={`pad-${i}`} position={p} carRef={carRef} />
      ))}

      {PROPS.LAMPPOSTS.map((p, i) => (
        <LampPost key={`lamp-${i}`} position={p} />
      ))}

      {/* Zone entry pillars (4 corners of the plaza) */}
      <ZonePillar position={[20, 0, -20]} color="#3a6df0" />
      <ZonePillar position={[20, 0, 20]} color="#3aa86b" />
      <ZonePillar position={[-20, 0, 20]} color="#e07a3a" />
      <ZonePillar position={[-20, 0, -20]} color="#9b59f6" />
    </>
  );
}
