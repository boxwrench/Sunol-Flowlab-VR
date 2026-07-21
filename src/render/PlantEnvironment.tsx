import { useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BackSide,
  Color,
  DataTexture,
  InstancedMesh,
  LinearFilter,
  LinearMipmapLinearFilter,
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
  readonly finish?: 'luminous' | 'satin'
  readonly animated?: boolean
}

const WALL_BASE_COLOR = '#aab6b0'
const WALL_UPPER_COLOR = '#c4cbc6'
const WALL_FRAME_COLOR = '#87958f'
const BENCH_COLOR = '#354d49'
const BENCH_TOP_COLOR = '#d9d4c8'
export type LabPanoramaId = 'hetchy' | 'sunol'

const LAB_PANORAMAS: Readonly<
  Record<LabPanoramaId, { readonly heightMeters: number; readonly url: string }>
> = {
  hetchy: {
    heightMeters: 46.5,
    url: `${import.meta.env.BASE_URL}panoramas/hetchy.jpg`,
  },
  sunol: {
    heightMeters: 27.8,
    url: `${import.meta.env.BASE_URL}panoramas/sunol.jpg`,
  },
}
const PANORAMA_RADIUS_METERS = 24
const STIRRER_SCALE = new Vector3(0.14, 0.025, 0.035)
const CEILING_UNDERSIDE_Y_METERS = 3.17
const WINDOW_PILLAR_BOTTOM_Y_METERS = 1
const WINDOW_HEADER_BOTTOM_Y_METERS = 2.76
const WINDOW_PILLAR_HEIGHT_METERS =
  CEILING_UNDERSIDE_Y_METERS - WINDOW_PILLAR_BOTTOM_Y_METERS
const WINDOW_PILLAR_CENTER_Y_METERS =
  WINDOW_PILLAR_BOTTOM_Y_METERS + WINDOW_PILLAR_HEIGHT_METERS / 2
const WINDOW_HEADER_HEIGHT_METERS =
  CEILING_UNDERSIDE_Y_METERS - WINDOW_HEADER_BOTTOM_Y_METERS
const WINDOW_HEADER_CENTER_Y_METERS =
  WINDOW_HEADER_BOTTOM_Y_METERS + WINDOW_HEADER_HEIGHT_METERS / 2
const WINDOW_TRIM_THICKNESS_METERS = 0.06
const REAR_WINDOW_TRIM_Z_METERS = -3.69
const SIDE_WINDOW_TRIM_X_METERS = 4.09
const LAB_SURFACE_TEXTURE_SIZE = 64
const LAB_SURFACE_TEXTURE_REPEAT = 5

const LAB_BOXES: readonly LabBox[] = [
  { position: [0, -0.1, 0.55], scale: [8.6, 0.16, 8.9], color: '#52615e' },
  {
    position: [0, CEILING_UNDERSIDE_Y_METERS + 0.06, 0.55],
    scale: [8.6, 0.12, 8.9],
    color: '#d7ddd8',
  },

  { position: [0, 0.5, -3.8], scale: [8.4, 1, 0.16], color: WALL_BASE_COLOR },
  {
    position: [0, WINDOW_HEADER_CENTER_Y_METERS, -3.8],
    scale: [8.4, WINDOW_HEADER_HEIGHT_METERS, 0.16],
    color: WALL_UPPER_COLOR,
  },
  {
    position: [-3.95, WINDOW_PILLAR_CENTER_Y_METERS, REAR_WINDOW_TRIM_Z_METERS],
    scale: [0.5, WINDOW_PILLAR_HEIGHT_METERS, WINDOW_TRIM_THICKNESS_METERS],
    color: WALL_FRAME_COLOR,
  },
  {
    position: [3.95, WINDOW_PILLAR_CENTER_Y_METERS, REAR_WINDOW_TRIM_Z_METERS],
    scale: [0.5, WINDOW_PILLAR_HEIGHT_METERS, WINDOW_TRIM_THICKNESS_METERS],
    color: WALL_FRAME_COLOR,
  },
  {
    position: [0, WINDOW_PILLAR_CENTER_Y_METERS, REAR_WINDOW_TRIM_Z_METERS],
    scale: [0.24, WINDOW_PILLAR_HEIGHT_METERS, WINDOW_TRIM_THICKNESS_METERS],
    color: WALL_FRAME_COLOR,
  },

  {
    position: [-4.2, 0.5, 0.55],
    scale: [0.16, 1, 8.7],
    color: WALL_BASE_COLOR,
  },
  {
    position: [-4.2, WINDOW_HEADER_CENTER_Y_METERS, 0.55],
    scale: [0.16, WINDOW_HEADER_HEIGHT_METERS, 8.7],
    color: WALL_UPPER_COLOR,
  },
  {
    position: [
      -SIDE_WINDOW_TRIM_X_METERS,
      WINDOW_PILLAR_CENTER_Y_METERS,
      -3.45,
    ],
    scale: [WINDOW_TRIM_THICKNESS_METERS, WINDOW_PILLAR_HEIGHT_METERS, 0.7],
    color: WALL_FRAME_COLOR,
  },
  {
    position: [-SIDE_WINDOW_TRIM_X_METERS, WINDOW_PILLAR_CENTER_Y_METERS, 4.05],
    scale: [WINDOW_TRIM_THICKNESS_METERS, WINDOW_PILLAR_HEIGHT_METERS, 1.7],
    color: WALL_FRAME_COLOR,
  },
  {
    position: [-SIDE_WINDOW_TRIM_X_METERS, WINDOW_PILLAR_CENTER_Y_METERS, 0.2],
    scale: [WINDOW_TRIM_THICKNESS_METERS, WINDOW_PILLAR_HEIGHT_METERS, 0.18],
    color: WALL_FRAME_COLOR,
  },

  { position: [4.2, 0.5, 0.55], scale: [0.16, 1, 8.7], color: WALL_BASE_COLOR },
  {
    position: [4.2, WINDOW_HEADER_CENTER_Y_METERS, 0.55],
    scale: [0.16, WINDOW_HEADER_HEIGHT_METERS, 8.7],
    color: WALL_UPPER_COLOR,
  },
  {
    position: [SIDE_WINDOW_TRIM_X_METERS, WINDOW_PILLAR_CENTER_Y_METERS, -3.45],
    scale: [WINDOW_TRIM_THICKNESS_METERS, WINDOW_PILLAR_HEIGHT_METERS, 0.7],
    color: WALL_FRAME_COLOR,
  },
  {
    position: [SIDE_WINDOW_TRIM_X_METERS, WINDOW_PILLAR_CENTER_Y_METERS, 4.05],
    scale: [WINDOW_TRIM_THICKNESS_METERS, WINDOW_PILLAR_HEIGHT_METERS, 1.7],
    color: WALL_FRAME_COLOR,
  },
  {
    position: [SIDE_WINDOW_TRIM_X_METERS, WINDOW_PILLAR_CENTER_Y_METERS, 0.2],
    scale: [WINDOW_TRIM_THICKNESS_METERS, WINDOW_PILLAR_HEIGHT_METERS, 0.18],
    color: WALL_FRAME_COLOR,
  },

  {
    position: [0, CEILING_UNDERSIDE_Y_METERS / 2, 4.9],
    scale: [8.4, CEILING_UNDERSIDE_Y_METERS, 0.16],
    color: WALL_BASE_COLOR,
  },

  { position: [0, 0.44, -3.15], scale: [6.6, 0.82, 0.95], color: BENCH_COLOR },
  {
    position: [0, 0.89, -3.15],
    scale: [6.75, 0.08, 1.05],
    color: BENCH_TOP_COLOR,
    finish: 'satin',
  },
  {
    position: [-3.55, 0.44, -0.65],
    scale: [0.95, 0.82, 4.7],
    color: '#3b514d',
  },
  {
    position: [-3.55, 0.89, -0.65],
    scale: [1.05, 0.08, 4.85],
    color: BENCH_TOP_COLOR,
    finish: 'satin',
  },
  {
    position: [3.55, 0.44, -0.65],
    scale: [0.95, 0.82, 4.7],
    color: '#405652',
  },
  {
    position: [3.55, 0.89, -0.65],
    scale: [1.05, 0.08, 4.85],
    color: BENCH_TOP_COLOR,
    finish: 'satin',
  },

  {
    position: [-1.5, 1.24, -3.12],
    scale: [0.9, 0.62, 0.55],
    color: '#25383f',
    finish: 'satin',
  },
  {
    position: [0, 1.24, -3.12],
    scale: [0.9, 0.62, 0.55],
    color: '#2e4145',
    finish: 'satin',
  },
  {
    position: [1.5, 1.24, -3.12],
    scale: [0.9, 0.62, 0.55],
    color: '#243b42',
    finish: 'satin',
  },
  {
    position: [-1.5, 1.31, -2.83],
    scale: [0.56, 0.25, 0.035],
    color: '#6fd1ca',
    finish: 'luminous',
  },
  {
    position: [0, 1.31, -2.83],
    scale: [0.56, 0.25, 0.035],
    color: '#82ded1',
    finish: 'luminous',
  },
  {
    position: [1.5, 1.31, -2.83],
    scale: [0.56, 0.25, 0.035],
    color: '#64c4c2',
    finish: 'luminous',
  },

  {
    position: [-2.2, 3.02, -0.4],
    scale: [1.35, 0.05, 0.45],
    color: '#f4dfae',
    finish: 'luminous',
  },
  {
    position: [0, 3.02, -0.4],
    scale: [1.35, 0.05, 0.45],
    color: '#f7e7bb',
    finish: 'luminous',
  },
  {
    position: [2.2, 3.02, -0.4],
    scale: [1.35, 0.05, 0.45],
    color: '#f4dfae',
    finish: 'luminous',
  },
  {
    position: [-3.55, 1.005, -0.3],
    scale: [0.14, 0.025, 0.035],
    color: '#1f3432',
    finish: 'satin',
    animated: true,
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

const SHADED_LAB_BOXES = LAB_BOXES.filter(({ finish }) => finish !== 'luminous')
const LUMINOUS_LAB_BOXES = LAB_BOXES.filter(
  ({ finish }) => finish === 'luminous',
)
const SHADED_LAB_BOX_COLORS = SHADED_LAB_BOXES.map(
  ({ color }) => new Color(color),
)
const LUMINOUS_LAB_BOX_COLORS = LUMINOUS_LAB_BOXES.map(
  ({ color }) => new Color(color),
)
const STIRRER_BOX_INDEX = SHADED_LAB_BOXES.findIndex(
  ({ animated }) => animated === true,
)
const LAB_LABEL_WIDTH = 1.5
const LAB_LABEL_HEIGHT = 0.24
const LAB_LABEL_TEXTURE_WIDTH = Math.round(
  256 * (LAB_LABEL_WIDTH / LAB_LABEL_HEIGHT),
)

export const PLANT_ENVIRONMENT_RENDER_BUDGET = Object.freeze({
  sourceDrawCalls: 6,
  materialCount: 6,
  triangles:
    LAB_BOXES.length * 12 + BEAKER_POSITIONS.length * (24 + 48) + 128 + 2,
  externalTextureBytes: 3_947_484,
  decodedPanoramaBytes: 55_332_856,
  generatedLabelTextureBytes: LAB_LABEL_TEXTURE_WIDTH * 256 * 4,
  generatedSurfaceTextureBytes:
    LAB_SURFACE_TEXTURE_SIZE * LAB_SURFACE_TEXTURE_SIZE * 4,
})

export const PLANT_ENVIRONMENT_SURFACE_TEXTURE = Object.freeze({
  size: LAB_SURFACE_TEXTURE_SIZE,
  repeat: LAB_SURFACE_TEXTURE_REPEAT,
  generatedBytes: LAB_SURFACE_TEXTURE_SIZE * LAB_SURFACE_TEXTURE_SIZE * 4,
})

export const PLANT_ENVIRONMENT_VERTICAL_SEAMS = Object.freeze({
  ceilingUndersideY: CEILING_UNDERSIDE_Y_METERS,
  frontWallTopY: CEILING_UNDERSIDE_Y_METERS,
  windowHeaderTopY:
    WINDOW_HEADER_CENTER_Y_METERS + WINDOW_HEADER_HEIGHT_METERS / 2,
  windowPillarTopY:
    WINDOW_PILLAR_CENTER_Y_METERS + WINDOW_PILLAR_HEIGHT_METERS / 2,
})

export const PLANT_ENVIRONMENT_SURFACE_JOINS = Object.freeze({
  rearWallInteriorZ: -3.8 + 0.16 / 2,
  rearTrimAttachmentZ:
    REAR_WINDOW_TRIM_Z_METERS - WINDOW_TRIM_THICKNESS_METERS / 2,
  leftWallInteriorX: -4.2 + 0.16 / 2,
  leftTrimAttachmentX:
    -SIDE_WINDOW_TRIM_X_METERS - WINDOW_TRIM_THICKNESS_METERS / 2,
  rightWallInteriorX: 4.2 - 0.16 / 2,
  rightTrimAttachmentX:
    SIDE_WINDOW_TRIM_X_METERS + WINDOW_TRIM_THICKNESS_METERS / 2,
})

function populateLabBoxes(
  instances: InstancedMesh,
  boxes: readonly LabBox[],
  colors: readonly Color[],
  transform: Matrix4,
): void {
  for (let index = 0; index < boxes.length; index += 1) {
    const { position, scale } = boxes[index]
    transform.makeScale(scale[0], scale[1], scale[2])
    transform.setPosition(position[0], position[1], position[2])
    instances.setMatrixAt(index, transform)
    instances.setColorAt(index, colors[index])
  }
  instances.instanceMatrix.needsUpdate = true
  if (instances.instanceColor !== null)
    instances.instanceColor.needsUpdate = true
}

function createLabSurfaceTexture(): DataTexture {
  const data = new Uint8Array(
    LAB_SURFACE_TEXTURE_SIZE * LAB_SURFACE_TEXTURE_SIZE * 4,
  )
  for (let y = 0; y < LAB_SURFACE_TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < LAB_SURFACE_TEXTURE_SIZE; x += 1) {
      let hash = Math.imul(x + 1, 374_761_393) ^ Math.imul(y + 1, 668_265_263)
      hash = Math.imul(hash ^ (hash >>> 13), 1_274_126_177)
      const fineVariation = ((hash >>> 24) & 0xff) / 255
      const broadVariation = Math.sin(x * 0.41) * 3 + Math.cos(y * 0.37) * 3
      const value = Math.max(
        230,
        Math.min(255, Math.round(240 + fineVariation * 10 + broadVariation)),
      )
      const offset = (y * LAB_SURFACE_TEXTURE_SIZE + x) * 4
      data[offset] = value
      data[offset + 1] = Math.min(255, value + 1)
      data[offset + 2] = Math.max(0, value - 2)
      data[offset + 3] = 255
    }
  }

  const texture = new DataTexture(
    data,
    LAB_SURFACE_TEXTURE_SIZE,
    LAB_SURFACE_TEXTURE_SIZE,
  )
  texture.colorSpace = SRGBColorSpace
  texture.generateMipmaps = true
  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(LAB_SURFACE_TEXTURE_REPEAT, LAB_SURFACE_TEXTURE_REPEAT)
  texture.needsUpdate = true
  return texture
}

export function PlantEnvironment({
  panorama = 'hetchy',
}: {
  readonly panorama?: LabPanoramaId
}) {
  const shadedLabBoxesRef = useRef<InstancedMesh>(null)
  const luminousLabBoxesRef = useRef<InstancedMesh>(null)
  const beakersRef = useRef<InstancedMesh>(null)
  const beakerFluidsRef = useRef<InstancedMesh>(null)
  const stirrerAngleRef = useRef(0)
  const transform = useMemo(() => new Matrix4(), [])
  const labSurfaceTexture = useMemo(() => createLabSurfaceTexture(), [])

  useEffect(
    () => () => {
      labSurfaceTexture.dispose()
    },
    [labSurfaceTexture],
  )

  useLayoutEffect(() => {
    const shadedLabBoxes = shadedLabBoxesRef.current
    const luminousLabBoxes = luminousLabBoxesRef.current
    const beakers = beakersRef.current
    const beakerFluids = beakerFluidsRef.current
    if (
      shadedLabBoxes === null ||
      luminousLabBoxes === null ||
      beakers === null ||
      beakerFluids === null
    )
      return

    populateLabBoxes(
      shadedLabBoxes,
      SHADED_LAB_BOXES,
      SHADED_LAB_BOX_COLORS,
      transform,
    )
    populateLabBoxes(
      luminousLabBoxes,
      LUMINOUS_LAB_BOXES,
      LUMINOUS_LAB_BOX_COLORS,
      transform,
    )

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
    const shadedLabBoxes = shadedLabBoxesRef.current
    if (shadedLabBoxes === null || STIRRER_BOX_INDEX < 0) return
    stirrerAngleRef.current += deltaSeconds * 0.7
    transform.makeRotationY(stirrerAngleRef.current)
    transform.scale(STIRRER_SCALE)
    transform.setPosition(-3.55, 1.005, -0.3)
    shadedLabBoxes.setMatrixAt(STIRRER_BOX_INDEX, transform)
    shadedLabBoxes.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[...APPARATUS_WORLD_POSITION]}>
      <Suspense fallback={null}>
        <LabPanorama panorama={panorama} />
      </Suspense>

      <instancedMesh
        ref={shadedLabBoxesRef}
        args={[undefined, undefined, SHADED_LAB_BOXES.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={'#ffffff'}
          map={labSurfaceTexture}
          metalness={0.06}
          roughness={0.72}
        />
      </instancedMesh>

      <instancedMesh
        ref={luminousLabBoxesRef}
        args={[undefined, undefined, LUMINOUS_LAB_BOXES.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={'#ffffff'} toneMapped={false} />
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
        position={[1.35, 2.96, -3.69]}
        background={'#365753'}
        color={'#f3fbf8'}
        fontScale={0.48}
      />
    </group>
  )
}

function LabPanorama({ panorama }: { readonly panorama: LabPanoramaId }) {
  const panoramaConfig = LAB_PANORAMAS[panorama]
  const texture = useLoader(TextureLoader, panoramaConfig.url)
  const panoramaTexture = useMemo(() => {
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.repeat.x = -1
    texture.offset.x = 1
    texture.needsUpdate = true
    return texture
  }, [texture])

  return (
    <mesh position={[-0.4, panoramaConfig.heightMeters * 0.1, 1.8]}>
      <cylinderGeometry
        args={[
          PANORAMA_RADIUS_METERS,
          PANORAMA_RADIUS_METERS,
          panoramaConfig.heightMeters,
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
