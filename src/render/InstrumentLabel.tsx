import { useEffect, useMemo } from 'react'
import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
  type Euler,
  type Vector3,
} from 'three'

interface InstrumentLabelProps {
  readonly text: string
  readonly width: number
  readonly height: number
  readonly position: readonly [number, number, number]
  readonly rotation?: readonly [number, number, number]
  readonly color?: string
  readonly background?: string
  readonly fontScale?: number
}

export function InstrumentLabel({
  text,
  width,
  height,
  position,
  rotation = [0, 0, 0],
  color = '#e8fff9',
  background = 'transparent',
  fontScale = 0.64,
}: InstrumentLabelProps) {
  const texture = useMemo(
    () =>
      createLabelTexture(text, width / height, color, background, fontScale),
    [background, color, fontScale, height, text, width],
  )
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh
      position={position as unknown as Vector3}
      rotation={rotation as unknown as Euler}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent={background === 'transparent'}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function createLabelTexture(
  text: string,
  aspectRatio: number,
  color: string,
  background: string,
  fontScale: number,
) {
  const canvas = document.createElement('canvas')
  canvas.height = 256
  canvas.width = Math.min(
    2048,
    Math.max(256, Math.round(canvas.height * aspectRatio)),
  )
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas text rendering is unavailable')

  context.clearRect(0, 0, canvas.width, canvas.height)
  if (background !== 'transparent') {
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  context.fillStyle = color
  const lines = text.split('\n')
  const fontSize = Math.round(
    (canvas.height * fontScale) / Math.max(1, lines.length),
  )
  context.font = `700 ${fontSize}px Arial, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const lineHeight = fontSize * 1.08
  const firstBaseline =
    canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2
  for (let index = 0; index < lines.length; index += 1)
    context.fillText(
      lines[index],
      canvas.width / 2,
      firstBaseline + index * lineHeight,
      canvas.width * 0.96,
    )

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}
