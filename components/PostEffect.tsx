"use client";

import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";

export default function PostEffects() {
  return (
    <EffectComposer>
      <DepthOfField
        focusDistance={0.015}
        focalLength={0.025}
        bokehScale={2.5}
        height={480}
      />

      <Bloom
        intensity={0.45}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
      />

      <Noise opacity={0.02} />

      <Vignette
        eskil={false}
        offset={0.12}
        darkness={0.9}
      />
    </EffectComposer>
  );
}