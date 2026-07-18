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

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D bandTexture;
  uniform float opacityScale;
  varying vec2 vUv;

  void main() {
    float opticalLoad = texture2D(bandTexture, vec2(0.5, vUv.y)).r;
    float response = smoothstep(0.04, 0.95, opticalLoad);
    vec3 clearWater = vec3(0.055, 0.31, 0.32);
    vec3 cloudyWater = vec3(0.42, 0.49, 0.34);
    vec3 color = mix(clearWater, cloudyWater, response);
    float alpha = mix(0.22, 0.78, response) * opacityScale;
    gl_FragColor = vec4(color, alpha);
  }
`

function createGradientMaterial(texture: DataTexture, opacityScale: number) {
  return new ShaderMaterial({
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      bandTexture: { value: texture },
      opacityScale: { value: opacityScale },
    },
    vertexShader,
  })
}

export interface OpticalLoadBandsPresentation {
  readonly values: ArrayLike<number>
}

interface OpticalLoadGradientProps {
  readonly bands: OpticalLoadBandsPresentation
}

export function OpticalLoadGradient({ bands }: OpticalLoadGradientProps) {
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
  const backMaterial = useMemo(
    () => createGradientMaterial(texture, 1),
    [texture],
  )
  const middleMaterial = useMemo(
    () => createGradientMaterial(texture, 0.42),
    [texture],
  )

  useEffect(
    () => () => {
      backMaterial.dispose()
      middleMaterial.dispose()
      texture.dispose()
    },
    [backMaterial, middleMaterial, texture],
  )

  useFrame(() => {
    for (let index = 0; index < bands.values.length; index += 1)
      bandPixels[index] = Math.round(bands.values[index] * 255)
    texture.needsUpdate = true
  })

  return (
    <group>
      <mesh position={[0, 0.6, -0.39]} material={backMaterial}>
        <planeGeometry args={[1.45, 1.2]} />
      </mesh>
      <mesh position={[0, 0.6, 0]} material={middleMaterial}>
        <planeGeometry args={[1.45, 1.2]} />
      </mesh>
    </group>
  )
}
