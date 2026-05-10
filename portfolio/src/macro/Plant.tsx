import { CylinderCollider, RigidBody } from "@react-three/rapier";
import type { Vector3Tuple } from "three";

interface PlantProps {
  position?: Vector3Tuple;
}

export default function Plant({ position = [11, 0.3, 5.5] }: PlantProps) {
  return (
    <group position={position}>
      {/* Pot */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.4, 0.65]} position={[0, 0.4, 0]} />
        <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.62, 0.74, 0.8, 24]} />
          <meshStandardMaterial color="#a96a3e" roughness={0.85} />
        </mesh>
        {/* Pot rim */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.66, 0.62, 0.08, 24]} />
          <meshStandardMaterial color="#7a4a2a" roughness={0.9} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 24]} />
          <meshStandardMaterial color="#2a1d12" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Cactus body — main stem */}
      <mesh castShadow position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 1.8, 18]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>
      {/* Top dome */}
      <mesh castShadow position={[0, 2.6, 0]}>
        <sphereGeometry args={[0.32, 18, 12]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>

      {/* Left arm */}
      <mesh castShadow position={[-0.45, 1.7, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.16, 0.18, 0.8, 14]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.65, 2.0, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.65, 14]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.65, 2.35, 0]}>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>

      {/* Right arm (slightly smaller) */}
      <mesh castShadow position={[0.36, 1.55, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.14, 0.16, 0.6, 14]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.55, 1.78, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.45, 14]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.55, 2.05, 0]}>
        <sphereGeometry args={[0.14, 14, 10]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.7} />
      </mesh>

      {/* Tiny pink flower on top */}
      <mesh position={[0.04, 2.92, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#f06b8a" emissive="#f06b8a" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}
