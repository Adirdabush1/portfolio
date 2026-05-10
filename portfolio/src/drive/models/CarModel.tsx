import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Mesh } from "three";

const CAR_URL = "/models/drive/cybertruck.glb";

useGLTF.preload(CAR_URL);

export function CarModel() {
  const { scene } = useGLTF(CAR_URL);

  useEffect(() => {
    scene.traverse((o) => {
      if ((o as Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

export function CarFallback() {
  return (
    <group>
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.6, 0.55, 2.6]} />
        <meshStandardMaterial color="#d8392a" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.85, -0.25]}>
        <boxGeometry args={[1.3, 0.5, 1.4]} />
        <meshStandardMaterial color="#1d2233" roughness={0.3} metalness={0.4} />
      </mesh>
      {[
        [-0.85, 0.3, 0.95],
        [0.85, 0.3, 0.95],
        [-0.85, 0.3, -0.95],
        [0.85, 0.3, -0.95],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.25, 16]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
