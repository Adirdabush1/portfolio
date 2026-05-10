import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { Vector3Tuple } from "three";

interface KeyboardProps {
  position?: Vector3Tuple;
  rotationY?: number;
}

const BOARD_W = 7;
const BOARD_D = 3;
const BOARD_H = 0.25;

const KEY_COLOR = "#1a1a20";
const KEY_TOP = "#2a2a32";

interface KeyDef {
  x: number;
  z: number;
  w: number;
  d: number;
}

const KEY_W = 0.5;
const KEY_GAP = 0.55;

const KEYS: KeyDef[] = [
  // Row 1 (12 keys)
  ...Array.from({ length: 12 }, (_, i) => ({ x: -3.0 + i * KEY_GAP, z: -1.05, w: KEY_W, d: KEY_W })),
  // Row 2 (12)
  ...Array.from({ length: 12 }, (_, i) => ({ x: -2.85 + i * KEY_GAP, z: -0.45, w: KEY_W, d: KEY_W })),
  // Row 3 (home, 11)
  ...Array.from({ length: 11 }, (_, i) => ({ x: -2.7 + i * KEY_GAP, z: 0.15, w: KEY_W, d: KEY_W })),
  // Row 4 (10)
  ...Array.from({ length: 10 }, (_, i) => ({ x: -2.5 + i * KEY_GAP, z: 0.75, w: KEY_W, d: KEY_W })),
  // Spacebar row
  { x: -2.4, z: 1.3, w: 0.7, d: KEY_W },
  { x: 0, z: 1.3, w: 2.6, d: KEY_W },
  { x: 2.4, z: 1.3, w: 0.7, d: KEY_W },
];

export default function Keyboard({
  position = [-7, 0.3 + BOARD_H / 2, 3.5],
  rotationY = -0.05,
}: KeyboardProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Board base — drivable surface */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[BOARD_W / 2, BOARD_H / 2, BOARD_D / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[BOARD_W, BOARD_H, BOARD_D]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.65} metalness={0.25} />
        </mesh>

        {/* Keys */}
        {KEYS.map((k, i) => (
          <group key={i} position={[k.x, BOARD_H / 2 + 0.04, k.z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[k.w, 0.12, k.d]} />
              <meshStandardMaterial color={KEY_COLOR} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[k.w * 0.95, 0.025, k.d * 0.95]} />
              <meshStandardMaterial color={KEY_TOP} roughness={0.8} />
            </mesh>
          </group>
        ))}
      </RigidBody>

      {/* Subtle RGB underglow strip along the front edge */}
      <mesh position={[0, 0.07, BOARD_D / 2 + 0.015]}>
        <boxGeometry args={[BOARD_W * 0.95, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#55A5FE"
          emissive="#55A5FE"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Soft drivable ramp leading up to the keyboard's left edge */}
      <RigidBody type="fixed" colliders="trimesh" position={[-BOARD_W / 2 - 1.0, -BOARD_H / 2, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 18]}>
          <boxGeometry args={[2, BOARD_H + 0.1, BOARD_D]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.7} />
        </mesh>
      </RigidBody>
    </group>
  );
}
