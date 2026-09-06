"use client";

import React, { Suspense, useMemo, useRef } from "react";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  Sky,
  Environment,
  OrbitControls,
  ContactShadows,
  Float,
  Instances,
  Instance,
  Cloud,
  Sparkles,
} from "@react-three/drei";

import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

import * as THREE from "three";

/* =========================================================
   NOISE TEXTURE
========================================================= */

function createNoiseTexture(size = 512, dark = false) {
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.Texture();

  const image = ctx.createImageData(size, size);

  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = dark
      ? Math.random() * 60 + 30
      : Math.random() * 90 + 120;

    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);

  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

  return tex;
}

/* =========================================================
   CAMERA FLOAT
========================================================= */

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    state.camera.position.y =
      7 + Math.sin(t * 0.25) * 0.08;

    state.camera.position.x =
      Math.sin(t * 0.12) * 0.12;
  });

  return null;
}

/* =========================================================
   DEPTH MIST
========================================================= */

function DepthMist() {
  return (
    <>
      {[...Array(10)].map((_, i) => (
        <mesh
          key={i}
          position={[0, 2 + i * 0.8, -5 - i * 4]}
        >
          <planeGeometry args={[60, 10]} />

          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.025}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

/* =========================================================
   BACKGROUND MOUNTAINS
========================================================= */

function BackgroundMountains() {
  return (
    <>
      {[...Array(7)].map((_, i) => (
        <mesh
          key={i}
          position={[0, 6 - i * 1.4, -35 - i * 14]}
        >
          <planeGeometry args={[120, 30]} />

          <meshStandardMaterial
            color="#56615c"
            transparent
            opacity={0.15 - i * 0.015}
          />
        </mesh>
      ))}
    </>
  );
}

/* =========================================================
   ATMOSPHERIC MIST
========================================================= */

function AtmosphericMist() {
  return (
    <>
      <Float speed={0.25} rotationIntensity={0}>
        <mesh position={[0, 2, -8]}>
          <planeGeometry args={[40, 12]} />

          <meshBasicMaterial
            transparent
            opacity={0.06}
            color="#dfe8ef"
            depthWrite={false}
          />
        </mesh>
      </Float>

      <Float speed={0.45} rotationIntensity={0}>
        <mesh position={[0, 5, -15]}>
          <planeGeometry args={[50, 15]} />

          <meshBasicMaterial
            transparent
            opacity={0.04}
            color="#cfd8dc"
            depthWrite={false}
          />
        </mesh>
      </Float>
    </>
  );
}

/* =========================================================
   WATERFALL
========================================================= */

function Waterfall() {
  const waterfall = useRef<THREE.Mesh>(null);

  const splash = useRef<THREE.Points>(null);

  const normalTexture = useMemo(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");

    if (!ctx) return new THREE.Texture();

    ctx.fillStyle = "#7ea6ff";

    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;

      const r = Math.random() * 3;

      ctx.fillStyle = `rgba(255,255,255,${
        Math.random() * 0.6
      })`;

      ctx.beginPath();

      ctx.arc(x, y, r, 0, Math.PI * 2);

      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);

    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

    return tex;
  }, []);

  const particles = useMemo(() => {
    const count = 1400;

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] =
        THREE.MathUtils.randFloat(-1.5, 1.5);

      positions[i * 3 + 1] =
        THREE.MathUtils.randFloat(-3, 0);

      positions[i * 3 + 2] =
        THREE.MathUtils.randFloat(-1.2, 1.2);
    }

    const geo = new THREE.BufferGeometry();

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    return geo;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (waterfall.current) {
      waterfall.current.rotation.z =
        Math.sin(t * 0.2) * 0.01;

      const mat =
        waterfall.current
          .material as THREE.MeshPhysicalMaterial;

      if (mat.normalMap) {
        mat.normalMap.offset.y = -t * 1;
      }
    }

    if (splash.current) {
      const pos =
        splash.current.geometry.attributes
          .position as THREE.BufferAttribute;

      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);

        y -= delta * 3;

        if (y < -5) {
          y = 0;

          pos.setX(
            i,
            THREE.MathUtils.randFloat(-1.5, 1.5)
          );

          pos.setZ(
            i,
            THREE.MathUtils.randFloat(-1, 1)
          );
        }

        pos.setY(i, y);
      }

      pos.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 4.5, -10]}>
      <mesh ref={waterfall}>
        <planeGeometry args={[4, 13, 64, 64]} />

        <meshPhysicalMaterial
          color="#d7f3ff"
          transparent
          opacity={0.6}
          transmission={1}
          thickness={1}
          roughness={0.02}
          metalness={0}
          ior={1.33}
          clearcoat={1}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(2, 2)}
        />
      </mesh>

      <points
        ref={splash}
        geometry={particles}
        position={[0, -5.8, 0]}
      >
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <Sparkles
        count={250}
        scale={[6, 4, 4]}
        size={2}
        speed={0.3}
        opacity={0.25}
        color="#ffffff"
        position={[0, -5, 0]}
      />
    </group>
  );
}

/* =========================================================
   TERRAIN
========================================================= */

function Terrain() {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      80,
      80,
      300,
      300
    );

    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const canyon =
        Math.max(0, Math.abs(x) - 3) * 0.65;

      const hills =
        Math.sin(x * 0.35) *
        Math.cos(y * 0.35) *
        1.4;

      const cliff =
        y < -4 ? Math.abs(y + 4) * 1.2 : 0;

      const noise1 =
        Math.sin(x * 0.18) *
        Math.cos(y * 0.18) *
        2;

      const noise2 =
        Math.sin(x * 0.8) *
        Math.cos(y * 0.8) *
        0.4;

      const noise3 =
        Math.sin(x * 2.2) *
        Math.cos(y * 2.2) *
        0.12;

      let z =
        canyon +
        hills +
        cliff +
        noise1 +
        noise2 +
        noise3;

      pos.setZ(i, z);
    }

    geo.computeVertexNormals();

    return geo;
  }, []);

  const moss = useMemo(
    () => createNoiseTexture(),
    []
  );

  return (
    <mesh
      geometry={terrainGeo}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.2, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        color="#42593b"
        map={moss}
        roughnessMap={moss}
        bumpMap={moss}
        bumpScale={0.2}
        roughness={1}
      />
    </mesh>
  );
}

/* =========================================================
   ROCKS
========================================================= */

function Rocks() {
  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(0.5, 1),
    []
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#404540",
        roughness: 1,
      }),
    []
  );

  const rocks = useMemo(() => {
    return [...Array(250)].map(() => ({
      position: [
        THREE.MathUtils.randFloatSpread(50),
        -0.2,
        THREE.MathUtils.randFloatSpread(50),
      ],
      scale: THREE.MathUtils.randFloat(0.4, 2.8),
      rotation: Math.random() * Math.PI,
    }));
  }, []);

  return (
    <>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          position={
            rock.position as [number, number, number]
          }
          scale={rock.scale}
          rotation={[
            rock.rotation,
            rock.rotation,
            rock.rotation,
          ]}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}

/* =========================================================
   FOREST
========================================================= */

function Forest() {
  const bark = useMemo(
    () => createNoiseTexture(256, true),
    []
  );

  const trunkGeo = useMemo(
    () =>
      new THREE.CylinderGeometry(
        0.2,
        0.45,
        12,
        10
      ),
    []
  );

  const trunkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#473b32",
        map: bark,
        roughness: 1,
      }),
    [bark]
  );

  const leafGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.5, 0.8);

    g.translate(0, 0.4, 0);

    return g;
  }, []);

  const leafMat = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: "#243a1d",
      side: THREE.DoubleSide,
      roughness: 0.85,
      transmission: 0.25,
      thickness: 0.2,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };

      shader.vertexShader =
        `
        uniform float time;
      ` + shader.vertexShader;

      shader.vertexShader =
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `
          vec3 transformed = vec3(position);

          transformed.x += sin(position.y * 5.0 + time) * 0.04;
          transformed.z += cos(position.y * 5.0 + time) * 0.04;
        `
        );

      mat.userData.shader = shader;
    };

    return mat;
  }, []);

  useFrame(({ clock }) => {
    if (leafMat.userData.shader) {
      leafMat.userData.shader.uniforms.time.value =
        clock.elapsedTime;
    }
  });

  const trees = useMemo(() => {
    return [...Array(120)].map(() => ({
      x: THREE.MathUtils.randFloatSpread(70),
      z: THREE.MathUtils.randFloat(-60, 10),
      scale: THREE.MathUtils.randFloat(0.8, 2.3),
    }));
  }, []);

  return (
    <>
      {trees.map((tree, i) => (
        <mesh
          key={i}
          geometry={trunkGeo}
          material={trunkMat}
          position={[
            tree.x,
            5,
            tree.z,
          ]}
          scale={tree.scale}
          castShadow
        />
      ))}

      <Instances
        geometry={leafGeo}
        material={leafMat}
        range={10000}
      >
        {trees.map((tree, idx) => (
          <group
            key={idx}
            position={[
              tree.x,
              0,
              tree.z,
            ]}
            scale={tree.scale}
          >
            {[...Array(180)].map((_, i) => {
              const phi =
                Math.random() * Math.PI * 2;

              const theta =
                Math.random() *
                (Math.PI / 1.8);

              const radius =
                THREE.MathUtils.randFloat(
                  1.4,
                  4
                );

              const x =
                radius *
                Math.sin(theta) *
                Math.cos(phi);

              const y =
                radius * Math.cos(theta) + 9;

              const z =
                radius *
                Math.sin(theta) *
                Math.sin(phi);

              return (
                <Instance
                  key={i}
                  position={[x, y, z]}
                  rotation={[
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    0,
                  ]}
                  scale={THREE.MathUtils.randFloat(
                    0.8,
                    1.6
                  )}
                />
              );
            })}
          </group>
        ))}
      </Instances>
    </>
  );
}

/* =========================================================
   POST FX
========================================================= */

function PostEffects() {
  return (
    <EffectComposer>
      <DepthOfField
        focusDistance={0.02}
        focalLength={0.03}
        bokehScale={2.5}
        height={480}
      />

      <Bloom
        intensity={0.7}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.95}
      />

      <Noise opacity={0.025} />

      <Vignette
        eskil={false}
        offset={0.18}
        darkness={1.15}
      />
    </EffectComposer>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function ImmersiveSanctuary() {
  return (
    <div className="w-full h-screen bg-[#eef1eb]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 7, 14],
          fov: 42,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace:
            THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <fogExp2
            attach="fog"
            args={["#dfe7df", 0.045]}
          />

          <Sky
            sunPosition={[10, 20, 8]}
            turbidity={8}
            rayleigh={2}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
          />

          <Environment preset="forest" />

          <ambientLight intensity={0.25} />

          <hemisphereLight
            intensity={0.5}
            color="#d7ecff"
            groundColor="#2e3528"
          />

          <directionalLight
            castShadow
            intensity={3}
            color="#fff4d6"
            position={[10, 20, 8]}
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
          />

          <directionalLight
            intensity={0.35}
            color="#88aaff"
            position={[-10, 8, -10]}
          />

          <spotLight
            position={[8, 15, 5]}
            angle={0.45}
            penumbra={1}
            intensity={2}
            castShadow
            color="#fff6dc"
          />

          <CameraRig />

          <BackgroundMountains />

          <DepthMist />

          <Terrain />

          <Rocks />

          <Forest />

          <Waterfall />

          <AtmosphericMist />

          <Cloud
            position={[0, 12, -25]}
            speed={0.15}
            opacity={0.18}
            segments={24}
          />

          <Sparkles
            count={600}
            scale={[50, 20, 50]}
            size={1.2}
            speed={0.12}
            opacity={0.15}
            color="#d7f2c8"
          />

          <ContactShadows
            position={[0, -1.15, 0]}
            opacity={0.45}
            scale={50}
            blur={3}
            far={8}
          />

          <OrbitControls
            enablePan={false}
            enableZoom
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.45}
            zoomSpeed={0.6}
            minDistance={9}
            maxDistance={16}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2.15}
            autoRotate
            autoRotateSpeed={0.08}
          />

          <PostEffects />
        </Suspense>
      </Canvas>
    </div>
  );
}