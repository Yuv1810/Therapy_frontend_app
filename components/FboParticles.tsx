"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import * as random from "maath/random";

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const arr = new Float32Array(1500 * 3);

    random.inSphere(arr, {
      radius: 4.0,
    });

    return arr;
  });

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y -= delta * 0.008;
    pointsRef.current.rotation.x -= delta * 0.003;

    pointsRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.05) * 0.06;

    pointsRef.current.rotation.y +=
      state.mouse.x * 0.02;

    pointsRef.current.rotation.x +=
      state.mouse.y * 0.02;
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled
    >
      <PointMaterial
        transparent
        color="#0a120d"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

export default function FboParticles() {
  return (
    <div className="absolute inset-0 z-[2] pointer-events-none">
      <Canvas
        camera={{
          position: [0, 0, 3],
          fov: 75,
        }}
      >
        <fog attach="fog" args={["#102015", 2, 6]} />

        <ParticleField />
      </Canvas>
    </div>
  );
}