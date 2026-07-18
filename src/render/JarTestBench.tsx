import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, DoubleSide, InstancedMesh, Matrix4, Path, Shape } from 'three'

import {
  JAR_TEST_RACK_BASE_HEIGHT_METERS,
  JAR_TEST_TABLETOP_HEIGHT_METERS,
} from './layout'

export const CANONICAL_JAR_DOSES = [0, 2, 4, 6, 8, 10] as const

const JAR_VESSEL_DIMENSIONS = [0.18, 0.36, 0.16] as const
const JAR_RIM_DIMENSIONS = [0.19, 0.014, 0.17] as const
const RAW_WATER_FILL_DIMENSIONS = [0.158, 0.26, 0.138] as const
const RAW_WATER_FILL_COLOR = '#6b7d57'
const JAR_WALL_EXTRUSION = {
  depth: JAR_VESSEL_DIMENSIONS[1],
  bevelEnabled: false,
  steps: 1,
}
const JAR_RIM_EXTRUSION = {
  depth: JAR_RIM_DIMENSIONS[1],
  bevelEnabled: false,
  steps: 1,
}

const TABLE_LEG_POSITIONS = [
  [-0.72, 0.35, -0.24],
  [-0.72, 0.35, 0.24],
  [0.72, 0.35, -0.24],
  [0.72, 0.35, 0.24],
] as const

function createRectangularRing(width: number, depth: number, border: number) {
  const halfWidth = width / 2
  const halfDepth = depth / 2
  const innerHalfWidth = halfWidth - border
  const innerHalfDepth = halfDepth - border
  const shape = new Shape()
  shape.moveTo(-halfWidth, -halfDepth)
  shape.lineTo(-halfWidth, halfDepth)
  shape.lineTo(halfWidth, halfDepth)
  shape.lineTo(halfWidth, -halfDepth)
  shape.lineTo(-halfWidth, -halfDepth)

  const opening = new Path()
  opening.moveTo(-innerHalfWidth, -innerHalfDepth)
  opening.lineTo(innerHalfWidth, -innerHalfDepth)
  opening.lineTo(innerHalfWidth, innerHalfDepth)
  opening.lineTo(-innerHalfWidth, innerHalfDepth)
  opening.lineTo(-innerHalfWidth, -innerHalfDepth)
  shape.holes.push(opening)
  return shape
}

export interface CanonicalJarSummaryPresentation {
  readonly dose: (typeof CANONICAL_JAR_DOSES)[number]
  readonly trialId: string
  readonly displayClarity: number
}

interface JarTestBenchProps {
  readonly summaries?: readonly CanonicalJarSummaryPresentation[]
}

const RAW_WATER_COLOR = new Color(RAW_WATER_FILL_COLOR)
const CLEARED_WATER_COLOR = new Color('#a9d6bd')

export function JarTestBench({ summaries = [] }: JarTestBenchProps) {
  const fillsRef = useRef<InstancedMesh>(null)
  const jarsRef = useRef<InstancedMesh>(null)
  const paddlesRef = useRef<InstancedMesh>(null)
  const rimsRef = useRef<InstancedMesh>(null)
  const tableLegsRef = useRef<InstancedMesh>(null)
  const summaryTokensRef = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Matrix4(), [])
  const jarWallShape = useMemo(
    () =>
      createRectangularRing(
        JAR_VESSEL_DIMENSIONS[0],
        JAR_VESSEL_DIMENSIONS[2],
        0.006,
      ),
    [],
  )
  const jarRimShape = useMemo(
    () =>
      createRectangularRing(
        JAR_RIM_DIMENSIONS[0],
        JAR_RIM_DIMENSIONS[2],
        0.014,
      ),
    [],
  )

  useLayoutEffect(() => {
    const fills = fillsRef.current
    const jars = jarsRef.current
    const paddles = paddlesRef.current
    const rims = rimsRef.current
    const tableLegs = tableLegsRef.current
    const summaryTokens = summaryTokensRef.current
    if (
      fills === null ||
      jars === null ||
      paddles === null ||
      rims === null ||
      tableLegs === null ||
      summaryTokens === null
    )
      return

    for (let index = 0; index < CANONICAL_JAR_DOSES.length; index += 1) {
      const x = (index - 2.5) * 0.25
      transform.makeTranslation(x, 0.17, 0)
      fills.setMatrixAt(index, transform)
      const dose = CANONICAL_JAR_DOSES[index]
      const summary = summaries.find((candidate) => candidate.dose === dose)
      fills.setColorAt(
        index,
        summary === undefined
          ? RAW_WATER_COLOR
          : RAW_WATER_COLOR.clone().lerp(
              CLEARED_WATER_COLOR,
              summary.displayClarity,
            ),
      )
      transform.makeRotationX(-Math.PI / 2)
      transform.setPosition(x, 0.04, 0)
      jars.setMatrixAt(index, transform)
      transform.makeTranslation(x, 0.48, 0)
      paddles.setMatrixAt(index, transform)
      transform.makeRotationX(-Math.PI / 2)
      transform.setPosition(x, 0.4, 0)
      rims.setMatrixAt(index, transform)
    }
    fills.instanceMatrix.needsUpdate = true
    if (fills.instanceColor !== null) fills.instanceColor.needsUpdate = true
    jars.instanceMatrix.needsUpdate = true
    paddles.instanceMatrix.needsUpdate = true
    rims.instanceMatrix.needsUpdate = true

    for (let index = 0; index < TABLE_LEG_POSITIONS.length; index += 1) {
      const [x, y, z] = TABLE_LEG_POSITIONS[index]
      transform.makeTranslation(x, y, z)
      tableLegs.setMatrixAt(index, transform)
    }
    tableLegs.instanceMatrix.needsUpdate = true

    let tokenIndex = 0
    for (let index = 0; index < CANONICAL_JAR_DOSES.length; index += 1) {
      const dose = CANONICAL_JAR_DOSES[index]
      if (!summaries.some((summary) => summary.dose === dose)) continue
      const x = (index - 2.5) * 0.25
      transform.makeTranslation(x, 0.61, 0.07)
      summaryTokens.setMatrixAt(tokenIndex, transform)
      tokenIndex += 1
    }
    summaryTokens.count = tokenIndex
    summaryTokens.instanceMatrix.needsUpdate = true
  }, [summaries, transform])

  return (
    <group position={[-1.2, 0.02, 0.48]} rotation={[0, 0.08, 0]}>
      <mesh position={[0, JAR_TEST_TABLETOP_HEIGHT_METERS, 0]}>
        <boxGeometry args={[1.72, 0.08, 0.62]} />
        <meshStandardMaterial color={'#6c746a'} roughness={0.72} />
      </mesh>
      <instancedMesh
        ref={tableLegsRef}
        args={[undefined, undefined, TABLE_LEG_POSITIONS.length]}
      >
        <boxGeometry args={[0.07, 0.7, 0.07]} />
        <meshStandardMaterial color={'#40514d'} roughness={0.78} />
      </instancedMesh>

      <group position={[0, JAR_TEST_RACK_BASE_HEIGHT_METERS, 0]} scale={1.08}>
        <instancedMesh
          ref={fillsRef}
          args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
        >
          <boxGeometry args={[...RAW_WATER_FILL_DIMENSIONS]} />
          <meshStandardMaterial
            color={'#ffffff'}
            roughness={0.72}
            transparent
            opacity={0.92}
            vertexColors
          />
        </instancedMesh>
        <instancedMesh
          ref={summaryTokensRef}
          args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
        >
          <octahedronGeometry args={[0.035, 0]} />
          <meshStandardMaterial
            color={'#ffbd59'}
            emissive={'#7a3f12'}
            emissiveIntensity={0.45}
          />
        </instancedMesh>
        <instancedMesh
          ref={jarsRef}
          args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
        >
          <extrudeGeometry args={[jarWallShape, JAR_WALL_EXTRUSION]} />
          <meshStandardMaterial
            color={'#b7e1da'}
            side={DoubleSide}
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </instancedMesh>
        <instancedMesh
          ref={rimsRef}
          args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
        >
          <extrudeGeometry args={[jarRimShape, JAR_RIM_EXTRUSION]} />
          <meshStandardMaterial color={'#c7eee8'} roughness={0.4} />
        </instancedMesh>
        <instancedMesh
          ref={paddlesRef}
          args={[undefined, undefined, CANONICAL_JAR_DOSES.length]}
        >
          <boxGeometry args={[0.018, 0.35, 0.018]} />
          <meshStandardMaterial color={'#a9b5ad'} roughness={0.5} />
        </instancedMesh>

        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.55, 0.04, 0.34]} />
          <meshStandardMaterial color={'#203b39'} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.69, 0]}>
          <boxGeometry args={[1.58, 0.055, 0.12]} />
          <meshStandardMaterial color={'#405d59'} roughness={0.6} />
        </mesh>
        <mesh position={[-0.78, 0.35, 0]}>
          <boxGeometry args={[0.04, 0.7, 0.1]} />
          <meshStandardMaterial color={'#405d59'} roughness={0.6} />
        </mesh>
        <mesh position={[0.78, 0.35, 0]}>
          <boxGeometry args={[0.04, 0.7, 0.1]} />
          <meshStandardMaterial color={'#405d59'} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
