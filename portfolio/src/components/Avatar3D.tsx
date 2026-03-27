import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import "./Avatar3D.css";

interface RobotProps {
  talking: boolean;
}

function Robot({ talking }: RobotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const antennaLightRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Idle float + rotation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.05;
      groupRef.current.rotation.y = talking
        ? Math.sin(t * 1.5) * 0.12
        : Math.sin(t * 0.3) * 0.15;
      groupRef.current.rotation.x = talking
        ? Math.sin(t * 2.5) * 0.05
        : Math.sin(t * 0.2) * 0.02;
    }

    // Eye glow pulse
    if (eyeLeftRef.current && eyeRightRef.current) {
      const intensity = talking
        ? 2 + Math.sin(t * 6) * 1.5
        : 1.2 + Math.sin(t * 1.5) * 0.3;
      (eyeLeftRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      (eyeRightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;

      // Blink
      const blinkCycle = t % 5;
      const blinkScale = blinkCycle > 4.8 && blinkCycle < 4.9 ? 0.1 : 1;
      eyeLeftRef.current.scale.y = blinkScale;
      eyeRightRef.current.scale.y = blinkScale;
    }

    // Mouth animation - jaw opens/closes
    if (jawRef.current) {
      if (talking) {
        const jawOpen = Math.abs(Math.sin(t * 7)) * 0.15;
        jawRef.current.rotation.x = jawOpen * 0.3;
        jawRef.current.position.y = -0.18 - jawOpen;
      } else {
        jawRef.current.rotation.x = 0;
        jawRef.current.position.y = -0.18;
      }
    }

    // Mouth glow bars
    if (mouthRef.current) {
      mouthRef.current.children.forEach((bar, i) => {
        if (talking) {
          const scale = 0.3 + Math.abs(Math.sin(t * 8 + i * 1.2)) * 0.7;
          bar.scale.y = scale;
        } else {
          bar.scale.y = 0.3;
        }
      });
    }

    // Antenna light
    if (antennaLightRef.current) {
      const glow = talking ? 3 + Math.sin(t * 4) * 2 : 1 + Math.sin(t * 1) * 0.5;
      (antennaLightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
    }

    // Inner glow
    if (innerGlowRef.current) {
      const opacity = talking ? 0.15 + Math.sin(t * 3) * 0.1 : 0.05;
      (innerGlowRef.current.material as THREE.MeshStandardMaterial).opacity = opacity;
    }
  });

  const metalMat = {
    color: "#7a8aa5",
    metalness: 0.9,
    roughness: 0.15,
  };

  const darkMetalMat = {
    color: "#5a6a85",
    metalness: 0.95,
    roughness: 0.1,
  };

  const accentColor = "#00b4ff";

  return (
    <group ref={groupRef}>
      {/* === HEAD === */}
      {/* Main head - rounded box shape */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.62, 64, 64]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Head top plate */}
      <mesh position={[0, 0.55, 0]} scale={[0.75, 0.12, 0.75]}>
        <cylinderGeometry args={[0.45, 0.5, 1, 32]} />
        <meshStandardMaterial {...darkMetalMat} />
      </mesh>

      {/* Inner glow sphere */}
      <mesh ref={innerGlowRef} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.58, 32, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1}
          transparent
          opacity={0.05}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Face plate / visor */}
      <mesh position={[0, 0.15, 0.45]} scale={[1.05, 0.65, 0.3]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#2a3050"
          metalness={0.3}
          roughness={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* === EYES === */}
      {/* Left eye */}
      <mesh ref={eyeLeftRef} position={[-0.18, 0.2, 0.55]}>
        <sphereGeometry args={[0.075, 32, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* Left eye outer ring */}
      <mesh position={[-0.18, 0.2, 0.53]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 16, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Right eye */}
      <mesh ref={eyeRightRef} position={[0.18, 0.2, 0.55]}>
        <sphereGeometry args={[0.075, 32, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* Right eye outer ring */}
      <mesh position={[0.18, 0.2, 0.53]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 16, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* === MOUTH === */}
      {/* Upper lip plate */}
      <mesh position={[0, -0.1, 0.62]}>
        <boxGeometry args={[0.3, 0.05, 0.1]} />
        <meshStandardMaterial color="#4a5570" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Upper lip edge - glowing accent */}
      <mesh position={[0, -0.125, 0.68]}>
        <boxGeometry args={[0.28, 0.02, 0.02]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Jaw - moves when talking */}
      <mesh ref={jawRef} position={[0, -0.18, 0.62]}>
        <boxGeometry args={[0.28, 0.05, 0.1]} />
        <meshStandardMaterial color="#4a5570" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Lower lip edge - glowing accent (child of jaw so it moves with it) */}
      <mesh position={[0, -0.155, 0.68]}>
        <boxGeometry args={[0.24, 0.02, 0.02]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Mouth interior glow (visible between lip and jaw) */}
      <mesh position={[0, -0.14, 0.64]}>
        <boxGeometry args={[0.24, 0.06, 0.06]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Equalizer bars inside mouth */}
      <group ref={mouthRef} position={[0, -0.14, 0.68]}>
        {[-0.08, -0.04, 0, 0.04, 0.08].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.025, 0.05, 0.015]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
      </group>

      {/* === ANTENNA === */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial {...darkMetalMat} />
      </mesh>
      {/* Antenna light */}
      <mesh ref={antennaLightRef} position={[0, 0.84, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1}
        />
      </mesh>

      {/* === SIDE PANELS === */}
      {/* Left ear panel */}
      <mesh position={[-0.58, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 6]} />
        <meshStandardMaterial {...darkMetalMat} />
      </mesh>
      <mesh position={[-0.63, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Right ear panel */}
      <mesh position={[0.58, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 6]} />
        <meshStandardMaterial {...darkMetalMat} />
      </mesh>
      <mesh position={[0.63, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* === NECK === */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.2, 16]} />
        <meshStandardMaterial {...darkMetalMat} />
      </mesh>
      {/* Neck ring */}
      <mesh position={[0, -0.38, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* === SHOULDERS === */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.45]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      {/* Shoulder accent line */}
      <mesh position={[0, -0.56, 0.23]}>
        <boxGeometry args={[0.85, 0.015, 0.01]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Chest plate detail */}
      <mesh position={[0, -0.72, 0.2]}>
        <circleGeometry args={[0.08, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

interface Avatar3DProps {
  talking: boolean;
}

export default function Avatar3D({ talking }: Avatar3DProps) {
  return (
    <div className={`avatar-3d-container ${talking ? "talking" : ""}`}>
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 35 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 4, 5]} intensity={0.7} />
        <directionalLight position={[-3, 2, 3]} intensity={0.3} color="#4060ff" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#00b4ff" />
        <Environment preset="city" />
        <Robot talking={talking} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
