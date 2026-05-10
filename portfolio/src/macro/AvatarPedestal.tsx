import { Suspense, useMemo, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, CanvasTexture, Mesh, Vector3 } from "three";
import type { Vector3Tuple } from "three";

interface AvatarPedestalProps {
  position: Vector3Tuple;
  rotationY: number;
}

const NOTE_W = 1.3;
const NOTE_T = 0.04;
const AVATAR_SCALE = 0.22;

function makeNote(text: string): CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#bce8ff";
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, "rgba(0,0,0,0.1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(20,20,30,0.85)";
  ctx.font = "bold 64px 'Caveat', 'Comic Sans MS', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h - 90);
  ctx.font = "bold 80px sans-serif";
  ctx.fillText("↑", w / 2, h - 200);
  return new CanvasTexture(canvas);
}

function Avatar() {
  const groupRef = useRef<Mesh>(null);
  const gltf = useGLTF("/avatar.glb");
  const offsetY = useRef(0);

  useEffect(() => {
    gltf.scene.traverse((o) => {
      if ((o as Mesh).isMesh) {
        (o as Mesh).castShadow = true;
        (o as Mesh).receiveShadow = true;
      }
    });
    // Compute model bounding box at unit scale to lift it so its lowest
    // point sits at y=0 (i.e., flush with the note surface, no burial).
    const box = new Box3().setFromObject(gltf.scene);
    const size = new Vector3();
    box.getSize(size);
    // box.min.y is the y-offset of the model's lowest point in its local space.
    offsetY.current = -box.min.y;
  }, [gltf]);

  return (
    <primitive
      ref={groupRef}
      object={gltf.scene}
      scale={[AVATAR_SCALE, AVATAR_SCALE, AVATAR_SCALE]}
      position={[0, NOTE_T + 0.005 + offsetY.current * AVATAR_SCALE, 0]}
    />
  );
}

function FallbackBust() {
  return (
    <group position={[0, NOTE_T + 0.05, 0]}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color="#e8c5a0" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.18, 12]} />
        <meshStandardMaterial color="#3a4252" roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function AvatarPedestal({ position, rotationY }: AvatarPedestalProps) {
  const tex = useMemo(() => makeNote("this is me"), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* The sticky note */}
      <mesh castShadow receiveShadow position={[0, NOTE_T / 2, 0]}>
        <boxGeometry args={[NOTE_W, NOTE_T, NOTE_W]} />
        <meshStandardMaterial color="#bce8ff" roughness={0.95} />
      </mesh>
      <mesh position={[0, NOTE_T + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[NOTE_W * 0.96, NOTE_W * 0.96]} />
        <meshStandardMaterial map={tex} transparent />
      </mesh>

      {/* Avatar as miniature figurine, lifted by its bbox */}
      <Suspense fallback={<FallbackBust />}>
        <Avatar />
      </Suspense>
    </group>
  );
}

useGLTF.preload("/avatar.glb");
