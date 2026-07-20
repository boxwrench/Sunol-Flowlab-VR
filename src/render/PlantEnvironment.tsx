import { useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BackSide,
  Color,
  InstancedMesh,
  Matrix4,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three'

import { InstrumentLabel } from './InstrumentLabel'
import { APPARATUS_WORLD_POSITION } from './layout'

interface LabBox {
  readonly position: readonly [number, number, number]
  readonly scale: readonly [number, number, number]
  readonly color: string
}

const WALL_COLOR = '#aeb8b2'
const BENCH_COLOR = '#445653'
const BENCH_TOP_COLOR = '#d2d7cf'
const ANALYZER_COLOR = '#273c42'
const SCREEN_COLOR = '#76d8d1'
const HETCHY_PANORAMA_URL = `${import.meta.env.BASE_URL}panoramas/hetchy.jpg`
const PANORAMA_RADIUS_METERS = 24
const PANORAMA_HEIGHT_METERS = 46.5
const PANORAMA_VERTICAL_SHIFT_METERS = PANORAMA_HEIGHT_METERS * 0.1
const STIRRER_SCALE = new Vector3(0.14, 0.025, 0.035)

const LAB_BOXES: readonly LabBox[] = [
  { position: [0, -0.1, 0.55], scale: [8.6, 0.16, 8.9], color: '#61706b' },
  { position: [0, 3.23, 0.55], scale: [8.6, 0.12, 8.9], color: '#c8cfca' },

  { position: [0, 0.5, -3.8], scale: [8.4, 1, 0.16], color: WALL_COLOR },
  { position: [0, 2.98, -3.8], scale: [8.4, 0.44, 0.16], color: WALL_COLOR },
  { position: [-3.95, 2.1, -3.8], scale: [0.5, 2.2, 0.16], color: WALL_COLOR },
  { position: [3.95, 2.1, -3.8], scale: [0.5, 2.2, 0.16], color: WALL_COLOR },
  { position: [0, 2.1, -3.8], scale: [0.24, 2.2, 0.16], color: WALL_COLOR },

  { position: [-4.2, 0.5, 0.55], scale: [0.16, 1, 8.7], color: WALL_COLOR },
  { position: [-4.2, 2.98, 0.55], scale: [0.16, 0.44, 8.7], color: WALL_COLOR },
  { position: [-4.2, 2.1, -3.45], scale: [0.16, 2.2, 0.7], color: WALL_COLOR },
  { position: [-4.2, 2.1, 4.05], scale: [0.16, 2.2, 1.7], color: WALL_COLOR },
  { position: [-4.2, 2.1, 0.2], scale: [0.16, 2.2, 0.18], color: WALL_COLOR },

  { position: [4.2, 0.5, 0.55], scale: [0.16, 1, 8.7], color: WALL_COLOR },
  { position: [4.2, 2.98, 0.55], scale: [0.16, 0.44, 8.7], color: WALL_COLOR },
  { position: [4.2, 2.1, -3.45], scale: [0.16, 2.2, 0.7], color: WALL_COLOR },
  { position: [4.2, 2.1, 4.05], scale: [0.16, 2.2, 1.7], color: WALL_COLOR },
  { position: [4.2, 2.1, 0.2], scale: [0.16, 2.2, 0.18], color: WALL_COLOR },

  { position: [0, 1.62, 4.9], scale: [8.4, 3.24, 0.16], color: WALL_COLOR },

  { position: [0, 0.44, -3.15], scale: [6.6, 0.82, 0.95], color: BENCH_COLOR },
  {
    position: [0, 0.89, -3.15],
    scale: [6.75, 0.08, 1.05],
    color: BENCH_TOP_COLOR,
  },
  {
    position: [-3.55, 0.44, -0.65],
    scale: [0.95, 0.82, 4.7],
    color: BENCH_COLOR,
  },
  {
    position: [-3.55, 0.89, -0.65],
    scale: [1.05, 0.08, 4.85],
    color: BENCH_TOP_COLOR,
  },
  {
    position: [3.55, 0.44, -0.65],
    scale: [0.95, 0.82, 4.7],
    color: BENCH_COLOR,
  },
  {
    position: [3.55, 0.89, -0.65],
    scale: [1.05, 0.08, 4.85],
    color: BENCH_TOP_COLOR,
  },

  {
    position: [-1.5, 1.24, -3.12],
    scale: [0.9, 0.62, 0.55],
    color: ANALYZER_COLOR,
  },
  {
    position: [0, 1.24, -3.12],
    scale: [0.9, 0.62, 0.55],
    color: ANALYZER_COLOR,
  },
  {
    position: [1.5, 1.24, -3.12],
    scale: [0.9, 0.62, 0.55],
    color: ANALYZER_COLOR,
  },
  {
    position: [-1.5, 1.31, -2.83],
    scale: [0.56, 0.25, 0.035],
    color: SCREEN_COLOR,
  },
  {
    position: [0, 1.31, -2.83],
    scale: [0.56, 0.25, 0.035],
    color: SCREEN_COLOR,
  },
  {
    position: [1.5, 1.31, -2.83],
    scale: [0.56, 0.25, 0.035],
    color: SCREEN_COLOR,
  },

  { position: [-2.2, 3.02, -0.4], scale: [1.35, 0.05, 0.45], color: '#fff0c2' },
  { position: [0, 3.02, -0.4], scale: [1.35, 0.05, 0.45], color: '#fff0c2' },
  { position: [2.2, 3.02, -0.4], scale: [1.35, 0.05, 0.45], color: '#fff0c2' },
  {
    position: [-3.55, 1.005, -0.3],
    scale: [0.14, 0.025, 0.035],
    color: '#263f3d',
  },
]

const BEAKER_POSITIONS = [
  [-3.55, 1.08, -1.7],
  [-3.55, 1.08, -1.0],
  [-3.55, 1.08, -0.3],
  [3.55, 1.08, -1.7],
  [3.55, 1.08, -1.0],
  [3.55, 1.08, -0.3],
  [-2.65, 1.08, -3.15],
  [2.65, 1.08, -3.15],
] as const

const LAB_BOX_COLORS = LAB_BOXES.map(({ color }) => new Color(color))
const STIRRER_BOX_INDEX = LAB_BOXES.length - 1
const LAB_LABEL_WIDTH = 1.5
const LAB_LABEL_HEIGHT = 0.24
const LAB_LABEL_TEXTURE_WIDTH = Math.round(
  256 * (LAB_LABEL_WIDTH / LAB_LABEL_HEIGHT),
)

export const PLANT_ENVIRONMENT_RENDER_BUDGET = Object.freeze({
  sourceDrawCalls: 5,
  materialCount: 5,
  triangles:
    LAB_BOXES.length * 12 + BEAKER_POSITIONS.length * (24 + 48) + 128 + 2,
  externalTextureBytes: 3_947_484,
  decodedPanoramaBytes: 33_549_312,
  generatedLabelTextureBytes: LAB_LABEL_TEXTURE_WIDTH * 256 * 4,
})

export function PlantEnvironment() {
  const labBoxesRef = useRef<InstancedMesh>(null)
  const beakersRef = useRef<InstancedMesh>(null)
  const beakerFluidsRef = useRef<InstancedMesh>(null)
  const stirrerAngleRef = useRef(0)
  const transform = useMemo(() => new Matrix4(), [])

  useLayoutEffect(() => {
    const labBoxes = labBoxesRef.current
    const beakers = beakersRef.current
    const beakerFluids = beakerFluidsRef.current
    if (labBoxes === null || beakers === null || beakerFluids === null) return

    for (let index = 0; index < LAB_BOXES.length; index += 1) {
      const { position, scale } = LAB_BOXES[index]
      transform.makeScale(scale[0], scale[1], scale[2])
      transform.setPosition(position[0], position[1], position[2])
      labBoxes.setMatrixAt(index, transform)
      labBoxes.setColorAt(index, LAB_BOX_COLORS[index])
    }
    labBoxes.instanceMatrix.needsUpdate = true
    if (labBoxes.instanceColor !== null)
      labBoxes.instanceColor.needsUpdate = true

    for (let index = 0; index < BEAKER_POSITIONS.length; index += 1) {
      const [x, y, z] = BEAKER_POSITIONS[index]
      transform.makeTranslation(x, y, z)
      beakers.setMatrixAt(index, transform)
      transform.makeTranslation(x, 1.005, z)
      beakerFluids.setMatrixAt(index, transform)
    }
    beakers.instanceMatrix.needsUpdate = true
    beakerFluids.instanceMatrix.needsUpdate = true
  }, [transform])

  useFrame((_, deltaSeconds) => {
    const labBoxes = labBoxesRef.current
    if (labBoxes === null) return
    stirrerAngleRef.current += deltaSeconds * 0.7
    transform.makeRotationY(stirrerAngleRef.current)
    transform.scale(STIRRER_SCALE)
    transform.setPosition(-3.55, 1.005, -0.3)
    labBoxes.setMatrixAt(STIRRER_BOX_INDEX, transform)
    labBoxes.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[...APPARATUS_WORLD_POSITION]}>
      <Suspense fallback={null}>
        <LabPanorama />
      </Suspense>

      <instancedMesh
        ref={labBoxesRef}
        args={[undefined, undefined, LAB_BOXES.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={'#ffffff'} roughness={0.84} />
      </instancedMesh>

      <instancedMesh
        ref={beakersRef}
        args={[undefined, undefined, BEAKER_POSITIONS.length]}
      >
        <cylinderGeometry args={[0.12, 0.1, 0.28, 12, 1, true]} />
        <meshStandardMaterial
          color={'#dbeeea'}
          depthWrite={false}
          opacity={0.32}
          transparent
        />
      </instancedMesh>

      <instancedMesh
        ref={beakerFluidsRef}
        args={[undefined, undefined, BEAKER_POSITIONS.length]}
      >
        <cylinderGeometry args={[0.09, 0.085, 0.11, 12]} />
        <meshBasicMaterial
          color={'#72b8ba'}
          depthWrite={false}
          opacity={0.58}
          toneMapped={false}
          transparent
        />
      </instancedMesh>

      <InstrumentLabel
        text={'WATER QUALITY LAB'}
        width={LAB_LABEL_WIDTH}
        height={LAB_LABEL_HEIGHT}
        position={[0, 2.96, -3.69]}
        background={'#365753'}
        color={'#f3fbf8'}
        fontScale={0.48}
      />
    </group>
  )
}

function LabPanorama() {
  const texture = useLoader(TextureLoader, HETCHY_PANORAMA_URL)
  const panoramaTexture = useMemo(() => {
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.repeat.x = -1
    texture.offset.x = 1
    texture.needsUpdate = true
    return texture
  }, [texture])

  return (
    <mesh position={[-0.4, PANORAMA_VERTICAL_SHIFT_METERS, 1.8]}>
      <cylinderGeometry
        args={[
          PANORAMA_RADIUS_METERS,
          PANORAMA_RADIUS_METERS,
          PANORAMA_HEIGHT_METERS,
          64,
          1,
          true,
        ]}
      />
      <meshBasicMaterial
        map={panoramaTexture}
        side={BackSide}
        toneMapped={false}
      />
    </mesh>
  )
}
