import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { WORLD, ROAD_HALF_WIDTH, PLAZA_RADIUS } from "./constants";

function makeAsphaltTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1a1a1d";
  ctx.fillRect(0, 0, size, size);

  // Coarse asphalt grain
  const noise = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < noise.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    const m = Math.random() < 0.005 ? 30 : 0; // occasional bright fleck
    noise.data[i] += n + m;
    noise.data[i + 1] += n + m;
    noise.data[i + 2] += n + m;
  }
  ctx.putImageData(noise, 0, 0);

  // Subtle paving seams every quarter, very dark
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= size; x += size / 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += size / 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(40, 40);
  tex.anisotropy = 4;
  return tex;
}

function makeRoadStripeTexture(horizontal: boolean): CanvasTexture {
  // Dashed center line + solid edges, transparent background
  const w = horizontal ? 256 : 128;
  const h = horizontal ? 128 : 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#fff";
  if (horizontal) {
    // edge stripes (solid white)
    ctx.fillRect(0, 6, w, 3);
    ctx.fillRect(0, h - 9, w, 3);
    // dashed center
    for (let x = 0; x < w; x += 64) ctx.fillRect(x, h / 2 - 1.5, 36, 3);
  } else {
    ctx.fillRect(6, 0, 3, h);
    ctx.fillRect(w - 9, 0, 3, h);
    for (let y = 0; y < h; y += 64) ctx.fillRect(w / 2 - 1.5, y, 3, 36);
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}

function makeCrosswalkTexture(): CanvasTexture {
  const w = 256;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  for (let x = 4; x < w - 8; x += 24) {
    ctx.fillRect(x, 4, 14, h - 8);
  }
  return new CanvasTexture(canvas);
}

function Sky() {
  return (
    <mesh scale={[600, 600, 600]}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        side={1}
        uniforms={{
          topColor: { value: { r: 0x35 / 255, g: 0x40 / 255, b: 0x70 / 255 } },
          bottomColor: { value: { r: 0x1c / 255, g: 0x22 / 255, b: 0x2a / 255 } },
        }}
        vertexShader={`
          varying vec3 vWorld;
          void main() {
            vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vWorld;
          void main() {
            float h = clamp(normalize(vWorld).y * 0.5 + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
          }
        `}
      />
    </mesh>
  );
}

function RoadStripes({
  start,
  length,
  horizontal,
}: {
  start: [number, number, number];
  length: number;
  horizontal: boolean;
}) {
  const tex = useMemo(() => makeRoadStripeTexture(horizontal), [horizontal]);
  if (horizontal) tex.repeat.set(length / 8, 1);
  else tex.repeat.set(1, length / 8);
  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[start[0], 0.02, start[2]]}
    >
      <planeGeometry
        args={
          horizontal
            ? [length, ROAD_HALF_WIDTH * 2]
            : [ROAD_HALF_WIDTH * 2, length]
        }
      />
      <meshStandardMaterial map={tex} transparent roughness={0.7} />
    </mesh>
  );
}

function Crosswalk({
  position,
  rotationY,
}: {
  position: [number, number, number];
  rotationY: number;
}) {
  const tex = useMemo(() => makeCrosswalkTexture(), []);
  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, rotationY]}
      position={[position[0], 0.025, position[2]]}
    >
      <planeGeometry args={[ROAD_HALF_WIDTH * 2, 3]} />
      <meshStandardMaterial map={tex} transparent />
    </mesh>
  );
}

function Roundabout() {
  return (
    <>
      {/* dashed circle lane around the central island */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[PLAZA_RADIUS - 0.6, PLAZA_RADIUS - 0.3, 64]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      {/* central traffic island (raised a bit, looks like a curb) */}
      <RigidBody type="fixed" colliders={false} position={[0, 0.15, 0]}>
        <CylinderCollider args={[0.15, 3.4]} />
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[3.2, 3.6, 0.3, 24]} />
          <meshStandardMaterial color="#22232c" roughness={0.6} />
        </mesh>
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.32, 0]}>
        <ringGeometry args={[3.0, 3.2, 24]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
    </>
  );
}

export default function World() {
  const tex = useMemo(makeAsphaltTexture, []);

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight
        position={[40, 60, 20]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-camera-near={0.1}
        shadow-camera-far={300}
      />
      <directionalLight
        position={[-30, 40, -20]}
        intensity={0.6}
        color="#aab5d8"
      />
      <hemisphereLight args={["#a8b5dc", "#3a3d45", 0.85]} />

      <Sky />
      <fog attach="fog" args={["#1c222a", 130, 360]} />

      {/* Asphalt floor (whole world is road) */}
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[WORLD.GROUND_SIZE, WORLD.GROUND_SIZE]} />
          <meshStandardMaterial map={tex} roughness={0.95} />
        </mesh>
        <CuboidCollider
          args={[WORLD.GROUND_SIZE / 2, 0.1, WORLD.GROUND_SIZE / 2]}
          position={[0, -0.1, 0]}
        />
      </RigidBody>

      <Roundabout />

      {/* Lane stripes along the 4 main roads */}
      <RoadStripes start={[0, 0, -100]} length={170} horizontal={false} />
      <RoadStripes start={[100, 0, 0]} length={170} horizontal />
      <RoadStripes start={[0, 0, 100]} length={170} horizontal={false} />
      <RoadStripes start={[-100, 0, 0]} length={170} horizontal />

      {/* Crosswalks where roads meet the roundabout (just outside the circle) */}
      <Crosswalk position={[0, 0, -PLAZA_RADIUS - 2]} rotationY={0} />
      <Crosswalk position={[0, 0, PLAZA_RADIUS + 2]} rotationY={0} />
      <Crosswalk position={[PLAZA_RADIUS + 2, 0, 0]} rotationY={Math.PI / 2} />
      <Crosswalk position={[-PLAZA_RADIUS - 2, 0, 0]} rotationY={Math.PI / 2} />

      {/* Crosswalks at midpoint of each road */}
      <Crosswalk position={[0, 0, -55]} rotationY={0} />
      <Crosswalk position={[0, 0, 55]} rotationY={0} />
      <Crosswalk position={[55, 0, 0]} rotationY={Math.PI / 2} />
      <Crosswalk position={[-55, 0, 0]} rotationY={Math.PI / 2} />

      {/* World boundary walls */}
      {[
        { pos: [WORLD.GROUND_SIZE / 2, 1, 0], size: [1, 2, WORLD.GROUND_SIZE / 2] },
        { pos: [-WORLD.GROUND_SIZE / 2, 1, 0], size: [1, 2, WORLD.GROUND_SIZE / 2] },
        { pos: [0, 1, WORLD.GROUND_SIZE / 2], size: [WORLD.GROUND_SIZE / 2, 2, 1] },
        { pos: [0, 1, -WORLD.GROUND_SIZE / 2], size: [WORLD.GROUND_SIZE / 2, 2, 1] },
      ].map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={w.pos as [number, number, number]}>
          <mesh visible={false}>
            <boxGeometry args={w.size as [number, number, number]} />
            <meshStandardMaterial />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
