import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  RedFormat,
  ShaderMaterial,
  UnsignedByteType,
} from 'three'

import type { TurbidityBandsView } from '../sim'

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D bandTexture;
  varying vec2 vUv;

  void main() {
    float turbidity = texture2D(bandTexture, vec2(0.5, vUv.y)).r;
    float response = smoothstep(0.04, 0.95, turbidity);
    vec3 clearWater = vec3(0.055, 0.31, 0.32);
    vec3 cloudyWater = vec3(0.42, 0.49, 0.34);
    vec3 color = mix(clearWater, cloudyWater, response);
    float alpha = mix(0.22, 0.78, response);
    gl_FragColor = vec4(color, alpha);
  }
`

interface TurbidityGradientProps {
  readonly bands: TurbidityBandsView
}

export function TurbidityGradient({ bands }: TurbidityGradientProps) {
  const bandPixels = useMemo(
    () => new Uint8Array(bands.values.length),
    [bands.values.length],
  )
  const texture = useMemo(() => {
    const nextTexture = new DataTexture(
      bandPixels,
      1,
      bands.values.length,
      RedFormat,
      UnsignedByteType,
    )
    nextTexture.minFilter = LinearFilter
    nextTexture.magFilter = LinearFilter
    nextTexture.wrapS = ClampToEdgeWrapping
    nextTexture.wrapT = ClampToEdgeWrapping
    nextTexture.generateMipmaps = false
    nextTexture.needsUpdate = true
    return nextTexture
  }, [bandPixels, bands.values.length])
  const material = useMemo(
    () =>
      new ShaderMaterial({
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: { bandTexture: { value: texture } },
        vertexShader,
      }),
    [texture],
  )

  useEffect(
    () => () => {
      material.dispose()
      texture.dispose()
    },
    [material, texture],
  )

  useFrame(() => {
    for (let index = 0; index < bands.values.length; index += 1)
      bandPixels[index] = Math.round(bands.values[index] * 255)
    texture.needsUpdate = true
  })

  return (
    <mesh position={[0, 0.6, -0.39]} material={material}>
      <planeGeometry args={[1.45, 1.2]} />
    </mesh>
  )
}
