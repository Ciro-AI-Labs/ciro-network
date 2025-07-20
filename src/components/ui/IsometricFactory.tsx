/*
  IsometricFactoryEnhanced.tsx – React component for Next.js / R3F
  ---------------------------------------------------------------
  • Adds an HDR environment map, ACES tone‑mapping & sRGB encoding.
  • Uses drei helpers (Environment, ContactShadows, OrbitControls).
  • Materials now reference the scene.environment automatically,
    giving them glossy reflections & coloured highlights.
  • A subtle bloom pass accentuates emissive surfaces.
  • Enhanced with breathing animations and visual polish.
*/

'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import {
  Environment,
  OrbitControls,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';

/* ——— Shared Materials (Memoized) ——— */
function useLunarMaterials() {
  const lunarMetalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#1a1a2e',
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  }), []);

  const lunarGoldMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffeb70',
    metalness: 1,
    roughness: 0.15,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  }), []);

  const nuclearBlueMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#00ffff',
    metalness: 0.2,
    roughness: 0.05,
    emissive: '#00ffff',
    emissiveIntensity: 1.5,
    transmission: 0.85,
    thickness: 0.5,
    ior: 1.4,
  }), []);

  return { lunarMetalMaterial, lunarGoldMaterial, nuclearBlueMaterial };
}

/* ——— Enhanced Bloom Effect ——— */
// Note: Bloom effect removed due to dependency requirements
// Can be re-added with @react-three/postprocessing package

/* ——— Components ——— */
function ProcessingTower() {
  const towerRef = useRef<THREE.Mesh>(null);
  const { lunarMetalMaterial, lunarGoldMaterial, nuclearBlueMaterial } = useLunarMaterials();
  
  useFrame(({ clock }) => {
    if (towerRef.current) {
      // Breathing animation - modulated rotation speed
      const breathingFactor = Math.sin(clock.elapsedTime * 0.5) * 0.1;
      towerRef.current.rotation.y += (0.2 + breathingFactor) * 0.01;
    }
  });

  return (
    <group>
      <mesh ref={towerRef} position={[0, 5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6, 6, 12, 6]} />
        <primitive object={lunarMetalMaterial} attach='material' />
      </mesh>

      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[3, 32, 32]} />
        <primitive object={nuclearBlueMaterial} attach='material' />
      </mesh>

      <mesh position={[0, 11, 0]} castShadow>
        <coneGeometry args={[6, 3, 6]} />
        <primitive object={lunarGoldMaterial} attach='material' />
      </mesh>

      <mesh position={[0, 13, 0]} castShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <primitive object={nuclearBlueMaterial} attach='material' />
      </mesh>

      {/* Uptime Ring - blinks once then stays solid */}
      <UptimeRing />
    </group>
  );
}

function UptimeRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current && ringRef.current.material) {
      // Blink once on load, then stay solid
      const time = clock.elapsedTime;
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      if (time < 2) {
        material.opacity = Math.sin(time * 10) * 0.5 + 0.5;
      } else {
        material.opacity = 1;
      }
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[7, 0.2, 8, 32]} />
      <meshBasicMaterial color="#00ffff" transparent />
    </mesh>
  );
}

function ComputeNode({ position, index }: { position: [number, number, number]; index: number }) {
  const nodeRef = useRef<THREE.Mesh>(null);
  const { lunarMetalMaterial, nuclearBlueMaterial } = useLunarMaterials();
  
  useFrame(({ clock }) => {
    if (nodeRef.current) {
      // Staggered breathing animation for each node
      const offset = index * 0.5; // Different phase for each node
      const breathingFactor = Math.sin(clock.elapsedTime * 0.3 + offset) * 0.08;
      nodeRef.current.rotation.y += (1.2 + breathingFactor) * 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={nodeRef} castShadow receiveShadow>
        <octahedronGeometry args={[4, 0]} />
        <primitive object={lunarMetalMaterial} attach='material' />
      </mesh>
      <mesh castShadow>
        <sphereGeometry args={[2, 16, 16]} />
        <primitive object={nuclearBlueMaterial} attach='material' />
      </mesh>
    </group>
  );
}

/* ——— Scene Wrapper ——— */
function FactoryScene() {
  return (
    <>
      {/* Key Light (sun) */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill & Rim */}
      <directionalLight position={[-15, 10, -10]} intensity={1.2} color={'#00ffff'} />
      <ambientLight intensity={0.4} />

      {/* Objects */}
      <ProcessingTower />
      <ComputeNode position={[-15, 2, 0]} index={0} />
      <ComputeNode position={[15, 2, 0]} index={1} />
      <ComputeNode position={[0, 2, -15]} index={2} />
      <ComputeNode position={[0, 2, 15]} index={3} />

      {/* Enhanced Contact Shadow */}
      <ContactShadows
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        opacity={0.6}
        width={80}
        height={80}
        blur={4}
        far={20}
      />

      {/* Environment */}
      <Environment preset='sunset' />
      <OrbitControls makeDefault enableDamping />

      {/* Enhanced Bloom Effect */}
      {/* Bloom effect removed due to dependency requirements */}
      {/* Can be re-added with @react-three/postprocessing package */}
    </>
  );
}

/* ——— Main Export ——— */
export default function IsometricFactory() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className='w-full h-[700px] bg-black/20 rounded-lg animate-pulse' />;
  }

  return (
    <div className='w-full h-[700px]'>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [25, 20, 25], fov: 50, near: 1, far: 200 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <FactoryScene />
        </Suspense>
      </Canvas>
    </div>
  );
} 