import { useRef } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { LAMP } from "./constants";
import { Object3D } from "three";

export default function Lamp() {
  const target = useRef<Object3D>(new Object3D());
  return (
    <group position={LAMP.POSITION}>
      {/* Base */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0.1, 0]} />
        <mesh castShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.45, 0.55, 0.2, 24]} />
          <meshStandardMaterial color="#1a1a1f" roughness={0.3} metalness={0.7} />
        </mesh>
      </RigidBody>

      {/* Vertical pole */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 2.5, 12]} />
        <meshStandardMaterial color="#16161a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Joint */}
      <mesh position={[0, 2.75, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#16161a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Arm leaning toward desk center */}
      <group position={[0, 2.75, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <mesh castShadow position={[LAMP.ARM_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, LAMP.ARM_LENGTH, 12]} />
          <meshStandardMaterial color="#16161a" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>

      {/* Lamp head (cone shade) */}
      <group position={[1.55, LAMP.HEAD_HEIGHT, 0]} rotation={[0, 0, -Math.PI / 2.6]}>
        <mesh castShadow>
          <coneGeometry args={[0.6, 0.85, 18, 1, true]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.4} metalness={0.7} side={2} />
        </mesh>
        {/* Bulb (emissive) */}
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.28, 16, 12]} />
          <meshStandardMaterial
            color={LAMP.WARM}
            emissive={LAMP.WARM}
            emissiveIntensity={2.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* SpotLight pointing down toward the desk center */}
      <primitive object={target.current} position={[5, -8, 5]} />
      <spotLight
        position={[1.55, LAMP.HEAD_HEIGHT, 0]}
        target={target.current}
        intensity={LAMP.CONE_INTENSITY}
        distance={LAMP.CONE_DISTANCE}
        angle={LAMP.CONE_ANGLE}
        penumbra={LAMP.CONE_PENUMBRA}
        color={LAMP.WARM}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}
