import { Text } from "@react-three/drei";
import { BILLBOARDS, type BillboardConfig } from "./constants";
import { driveStore, useDriveStore } from "./useDriveStore";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

// Use a single Latin character glyph cache so Troika never has to fetch
// a font over the network — every label still renders in the default font.
const FONT_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·—'!?";

interface BillboardProps {
  config: BillboardConfig;
}

function Billboard({ config }: BillboardProps) {
  const nearby = useDriveStore((s) => s.nearby);
  const isNear = nearby === config.id;
  const emissive = isNear ? config.color : "#000000";
  const emissiveIntensity = isNear ? 0.55 : 0;
  const scale = config.scale ?? 1;

  return (
    <group
      position={config.position}
      rotation={[0, config.rotationY ?? 0, 0]}
      scale={[scale, scale, scale]}
    >
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.1, 1.1, 0.1]} position={[0, 1.1, 0]} />
        <mesh castShadow position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.2, 12]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </RigidBody>

      <mesh
        position={[0, 2.7, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          driveStore.open(config.id);
        }}
      >
        <boxGeometry args={[2.4, 1.2, 0.12]} />
        <meshStandardMaterial
          color={config.color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.55}
        />
      </mesh>

      <Text
        position={[0, 2.85, 0.07]}
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        outlineWidth={0.005}
        outlineColor="#00000080"
        characters={FONT_CHARS}
      >
        {config.label}
      </Text>
      {config.sublabel && (
        <Text
          position={[0, 2.55, 0.07]}
          fontSize={0.13}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          fillOpacity={0.85}
        >
          {config.sublabel}
        </Text>
      )}

      {isNear && (
        <Text
          position={[0, 3.6, 0]}
          fontSize={0.18}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          Press E to open
        </Text>
      )}
    </group>
  );
}

export default function Billboards() {
  return (
    <>
      {BILLBOARDS.map((c) => (
        <Billboard key={c.id} config={c} />
      ))}
    </>
  );
}
