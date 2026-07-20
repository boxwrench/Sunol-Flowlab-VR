import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
} from 'three'

import type { CanonicalJarSummaryPresentation } from './JarTestBench'
import { InstrumentLabel } from './InstrumentLabel'

export type InstrumentationPhase =
  | 'READY'
  | 'RAPID_MIX'
  | 'FLOCCULATION'
  | 'SETTLING'
  | 'MEASURING'
  | 'COMPLETE'
  | 'REFILLING'

export interface InstrumentValueView {
  relativeOpticalLoad: number
}

export interface PhysicalPlotPoint {
  readonly trialId: string
  readonly dose: number
  readonly relativeOpticalLoad: number
}

export interface GhostControlSummary {
  readonly trialId: string
  readonly doseIndex: number
}

export interface ReplayInstrumentView {
  status: string
  elapsedSeconds: number
  durationSeconds: number
  relativeOpticalLoad: number | null
}

export interface PhysicalInstrumentationProps {
  readonly phase: InstrumentationPhase
  readonly instrumentView: InstrumentValueView
  readonly plotPoints: readonly PhysicalPlotPoint[]
  readonly canonicalSummaries: readonly CanonicalJarSummaryPresentation[]
  readonly ghosts: readonly GhostControlSummary[]
  readonly selectedGhostTrialId: string | null
  readonly replayView: ReplayInstrumentView
  readonly pendingGhostTrialId: string | null
  readonly refillEnabled: boolean
  readonly onRefill: () => void
  readonly onClearHistory: () => void
  readonly onSelectGhost: (trialId: string) => void
  readonly onPlayGhost: (trialId: string) => void
  readonly onPauseGhost: () => void
  readonly onResetGhost: () => void
  readonly onDeleteGhost: (trialId: string) => void
  readonly onReplaceOldestGhost: () => void
}

export type DeliberateActionState = 'latched' | 'armed'

export interface DeliberateActionTransition {
  readonly state: DeliberateActionState
  readonly commit: boolean
}

export function pressDeliberateAction(
  state: DeliberateActionState,
): DeliberateActionTransition {
  return state === 'latched'
    ? { state: 'armed', commit: false }
    : { state: 'latched', commit: true }
}

export function gaugeNeedleAngle(relativeOpticalLoad: number): number {
  const normalized = clamp01(relativeOpticalLoad)
  return Math.PI * (0.36 - normalized * 0.72)
}

export interface PlotMarker {
  readonly x: number
  readonly y: number
  readonly dose: number
  readonly relativeOpticalLoad: number
}

export function buildPlotMarkers(
  points: readonly PhysicalPlotPoint[],
): readonly PlotMarker[] {
  const repeats = new Uint8Array(11)
  return points.map((point) => {
    const dose = Math.min(10, Math.max(0, Math.round(point.dose)))
    const repeat = repeats[dose]
    repeats[dose] = Math.min(255, repeat + 1)
    const offset = ((repeat % 5) - 2) * 0.006
    return {
      x: -0.48 + dose * 0.096 + offset,
      y: -0.18 + clamp01(point.relativeOpticalLoad) * 0.34,
      dose,
      relativeOpticalLoad: clamp01(point.relativeOpticalLoad),
    }
  })
}

export function PhysicalInstrumentation(props: PhysicalInstrumentationProps) {
  return (
    <group position={[2.1, 0.88, 0.62]} rotation={[0, -0.72, 0]}>
      <mesh>
        <boxGeometry args={[1.22, 1.3, 0.055]} />
        <meshStandardMaterial color={'#263d39'} roughness={0.76} />
      </mesh>
      <InstrumentLabel
        text={`PHASE: ${phaseLabel(props.phase)}`}
        width={0.92}
        height={0.105}
        position={[0, 0.59, 0.12]}
        background={'#263d39'}
      />
      <RelativeLoadGauge
        phase={props.phase}
        instrumentView={props.instrumentView}
        replayView={props.replayView}
      />
      <DoseResponsePlot points={props.plotPoints} />
      <PhysicalActionControls {...props} />
    </group>
  )
}

function RelativeLoadGauge({
  phase,
  instrumentView,
  replayView,
}: {
  readonly phase: InstrumentationPhase
  readonly instrumentView: InstrumentValueView
  readonly replayView: ReplayInstrumentView
}) {
  const needleRef = useRef<Group>(null)
  const pastNeedleRef = useRef<Group>(null)
  const ticksRef = useRef<InstancedMesh>(null)
  const tickMatrix = useMemo(() => new Matrix4(), [])
  const currentAngle = useRef(
    gaugeNeedleAngle(instrumentView.relativeOpticalLoad),
  )
  const ticks = useMemo(
    () => Array.from({ length: 9 }, (_, index) => index),
    [],
  )
  useLayoutEffect(() => {
    const mesh = ticksRef.current
    if (mesh === null) return
    for (const tick of ticks) {
      const angle = gaugeNeedleAngle(tick / 8)
      tickMatrix.makeRotationZ(angle)
      tickMatrix.setPosition(
        Math.sin(-angle) * 0.18,
        Math.cos(angle) * 0.18,
        0.02,
      )
      mesh.setMatrixAt(tick, tickMatrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [tickMatrix, ticks])
  useFrame((_, elapsedSeconds) => {
    const target = gaugeNeedleAngle(instrumentView.relativeOpticalLoad)
    if (phase === 'MEASURING') {
      const blend = 1 - Math.exp(-elapsedSeconds * 5)
      currentAngle.current += (target - currentAngle.current) * blend
    } else {
      currentAngle.current = target
    }
    if (needleRef.current !== null)
      needleRef.current.rotation.z = currentAngle.current
    if (pastNeedleRef.current !== null) {
      pastNeedleRef.current.visible = replayView.relativeOpticalLoad !== null
      if (replayView.relativeOpticalLoad !== null)
        pastNeedleRef.current.rotation.z = gaugeNeedleAngle(
          replayView.relativeOpticalLoad,
        )
    }
  })

  return (
    <group position={[-0.35, 0.12, 0.045]}>
      <InstrumentLabel
        text={'RELATIVE\nTURBIDITY'}
        width={0.43}
        height={0.115}
        position={[0, 0.29, 0.07]}
        background={'#263d39'}
        fontScale={0.78}
      />
      <mesh>
        <circleGeometry args={[0.23, 32]} />
        <meshStandardMaterial color={'#d8ddc9'} roughness={0.8} />
      </mesh>
      <instancedMesh ref={ticksRef} args={[undefined, undefined, ticks.length]}>
        <boxGeometry args={[0.012, 0.045, 0.012]} />
        <meshStandardMaterial color={'#263d39'} />
      </instancedMesh>
      <group ref={needleRef}>
        <mesh position={[0, 0.105, 0.032]}>
          <boxGeometry args={[0.014, 0.21, 0.016]} />
          <meshStandardMaterial color={'#d6533f'} roughness={0.4} />
        </mesh>
      </group>
      <group ref={pastNeedleRef} visible={false}>
        <mesh position={[0, 0.085, 0.038]}>
          <boxGeometry args={[0.01, 0.17, 0.012]} />
          <meshStandardMaterial
            color={'#55d7d2'}
            emissive={'#166b69'}
            emissiveIntensity={0.65}
            roughness={0.35}
          />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.027, 0.027, 0.025, 16]} />
        <meshStandardMaterial color={'#1c302d'} />
      </mesh>
      <mesh position={[-0.15, -0.16, 0.025]}>
        <boxGeometry args={[0.1, 0.025, 0.012]} />
        <meshStandardMaterial color={'#63cdbf'} />
      </mesh>
      <mesh position={[0.15, -0.16, 0.025]}>
        <boxGeometry args={[0.1, 0.025, 0.012]} />
        <meshStandardMaterial color={'#d9904d'} />
      </mesh>
      <InstrumentLabel
        text={'CLEAR'}
        width={0.17}
        height={0.045}
        position={[-0.15, -0.205, 0.07]}
        color={'#9af4e8'}
        fontScale={0.54}
      />
      <InstrumentLabel
        text={'CLOUDY'}
        width={0.19}
        height={0.045}
        position={[0.15, -0.205, 0.07]}
        color={'#ffc077'}
        fontScale={0.5}
      />
      <InstrumentLabel
        text={'CYAN = PAST RUN'}
        width={0.26}
        height={0.04}
        position={[0, -0.255, 0.07]}
        color={'#73eee8'}
        fontScale={0.5}
      />
    </group>
  )
}

function DoseResponsePlot({
  points,
}: {
  readonly points: readonly PhysicalPlotPoint[]
}) {
  const ticksRef = useRef<InstancedMesh>(null)
  const pointsRef = useRef<InstancedMesh>(null)
  const matrix = useMemo(() => new Matrix4(), [])
  const markers = useMemo(() => buildPlotMarkers(points), [points])

  useLayoutEffect(() => {
    const ticks = ticksRef.current
    if (ticks !== null) {
      for (let index = 0; index <= 10; index += 1) {
        matrix.makeTranslation(-0.48 + index * 0.096, -0.2, 0)
        ticks.setMatrixAt(index, matrix)
      }
      ticks.instanceMatrix.needsUpdate = true
    }
    const pointMesh = pointsRef.current
    if (pointMesh !== null) {
      for (let index = 0; index < markers.length; index += 1) {
        const marker = markers[index]
        matrix.makeTranslation(marker.x, marker.y, 0)
        pointMesh.setMatrixAt(index, matrix)
      }
      pointMesh.count = markers.length
      pointMesh.instanceMatrix.needsUpdate = true
    }
  }, [markers, matrix])

  return (
    <group position={[0.22, 0.05, 0.045]}>
      <InstrumentLabel
        text={'DOSE vs FINAL TURBIDITY\nLOWER = CLEARER'}
        width={0.76}
        height={0.105}
        position={[0.12, 0.28, 0.07]}
        background={'#263d39'}
        fontScale={0.72}
      />
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.02, 0.018, 0.014]} />
        <meshStandardMaterial color={'#b8c9bd'} />
      </mesh>
      <mesh position={[-0.5, -0.01, 0]}>
        <boxGeometry args={[0.018, 0.4, 0.014]} />
        <meshStandardMaterial color={'#b8c9bd'} />
      </mesh>
      <instancedMesh ref={ticksRef} args={[undefined, undefined, 11]}>
        <boxGeometry args={[0.012, 0.045, 0.014]} />
        <meshStandardMaterial color={'#b8c9bd'} />
      </instancedMesh>
      <instancedMesh
        ref={pointsRef}
        args={[undefined, undefined, Math.max(1, points.length)]}
      >
        <sphereGeometry args={[0.026, 10, 8]} />
        <meshStandardMaterial
          color={'#ffbd59'}
          emissive={'#7a3f12'}
          emissiveIntensity={0.45}
        />
      </instancedMesh>
      <PlotDoseLabels />
    </group>
  )
}

function PlotDoseLabels() {
  const labelsRef = useRef<InstancedMesh>(null)
  const matrix = useMemo(() => new Matrix4(), [])
  const segments = useMemo(() => {
    const instances: Array<{
      readonly x: number
      readonly y: number
      readonly horizontal: boolean
    }> = []
    for (let dose = 0; dose <= 10; dose += 1) {
      const digits = String(dose)
      for (let digitIndex = 0; digitIndex < digits.length; digitIndex += 1) {
        const digit = digits[digitIndex]
        const digitOffset = (digitIndex - (digits.length - 1) / 2) * 0.028
        for (const segment of DIGIT_SEGMENTS[digit]) {
          const [x, y] = digitSegmentPosition(segment)
          instances.push({
            x: -0.48 + dose * 0.096 + digitOffset + x,
            y,
            horizontal: segment === 'a' || segment === 'd' || segment === 'g',
          })
        }
      }
    }
    return instances
  }, [])

  useLayoutEffect(() => {
    const mesh = labelsRef.current
    if (mesh === null) return
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index]
      matrix.makeScale(
        segment.horizontal ? 0.025 : 0.005,
        segment.horizontal ? 0.005 : 0.018,
        0.006,
      )
      matrix.setPosition(segment.x, segment.y, 0)
      mesh.setMatrixAt(index, matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [matrix, segments])

  return (
    <group position={[0, -0.27, 0.008]}>
      <instancedMesh
        ref={labelsRef}
        args={[undefined, undefined, segments.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={'#e2fff8'} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

const DIGIT_SEGMENTS: Readonly<Record<string, readonly string[]>> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'd', 'e', 'g'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['b', 'c', 'f', 'g'],
  '5': ['a', 'c', 'd', 'f', 'g'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
}

function PhysicalActionControls(props: PhysicalInstrumentationProps) {
  const selectedIndex = Math.max(
    0,
    props.ghosts.findIndex(
      (ghost) => ghost.trialId === props.selectedGhostTrialId,
    ),
  )
  const selected = props.ghosts[selectedIndex] ?? null
  const selectNext = () => {
    if (props.ghosts.length === 0) return
    const next = props.ghosts[(selectedIndex + 1) % props.ghosts.length]
    props.onSelectGhost(next.trialId)
  }

  return (
    <group position={[0, -0.53, 0.06]}>
      <InstrumentLabel
        text={'REFILL'}
        width={0.18}
        height={0.05}
        position={[-0.43, 0.18, 0.06]}
        fontScale={0.5}
      />
      <InstrumentLabel
        text={'CLEAR RESULTS x2'}
        width={0.28}
        height={0.05}
        position={[-0.18, 0.18, 0.06]}
        fontScale={0.43}
      />
      <InstrumentLabel
        text={'CLEAR\nx2'}
        width={0.13}
        height={0.075}
        position={[-0.18, 0, 0.06]}
        color={'#20302d'}
        fontScale={0.8}
      />
      <InstrumentLabel
        text={'COMPARE PAST RUN'}
        width={0.46}
        height={0.055}
        position={[0.39, 0.18, 0.06]}
        fontScale={0.48}
      />
      <RefillHandle enabled={props.refillEnabled} onRefill={props.onRefill} />
      <TearSheet
        enabled={props.plotPoints.length > 0}
        onClear={props.onClearHistory}
      />
      <GhostControls
        hasGhost={selected !== null}
        pendingReplacement={props.pendingGhostTrialId !== null}
        replayView={props.replayView}
        onSelectNext={selectNext}
        onPlayPause={() => {
          if (props.replayView.status === 'playing') props.onPauseGhost()
          else if (selected !== null) props.onPlayGhost(selected.trialId)
        }}
        onReset={props.onResetGhost}
        onDelete={() => {
          if (selected !== null) props.onDeleteGhost(selected.trialId)
        }}
        onReplace={props.onReplaceOldestGhost}
      />
    </group>
  )
}

function RefillHandle({
  enabled,
  onRefill,
}: {
  readonly enabled: boolean
  readonly onRefill: () => void
}) {
  return (
    <group position={[-0.43, 0, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.18, 0.08, 0.07]} />
        <meshStandardMaterial color={'#1b2e2b'} />
      </mesh>
      <mesh
        position={[0, 0.1, 0.02]}
        rotation={[0, 0, enabled ? -0.22 : 0]}
        onPointerDown={(event) => {
          event.stopPropagation()
          if (enabled) onRefill()
        }}
      >
        <boxGeometry args={[0.05, 0.24, 0.06]} />
        <meshStandardMaterial
          color={enabled ? '#65d8cf' : '#596b67'}
          emissive={enabled ? '#174f4d' : '#111d1b'}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  )
}

function TearSheet({
  enabled,
  onClear,
}: {
  readonly enabled: boolean
  readonly onClear: () => void
}) {
  const [state, setState] = useState<DeliberateActionState>('latched')
  const press = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (!enabled) return
    const transition = pressDeliberateAction(state)
    setState(transition.state)
    if (transition.commit) onClear()
  }
  return (
    <mesh
      position={[-0.18, state === 'armed' ? -0.055 : 0, 0]}
      onPointerDown={press}
    >
      <boxGeometry args={[0.16, 0.12, 0.035]} />
      <meshStandardMaterial
        color={!enabled ? '#626c63' : state === 'armed' ? '#f0a558' : '#d8ddc9'}
        roughness={0.78}
      />
    </mesh>
  )
}

function GhostControls({
  hasGhost,
  pendingReplacement,
  replayView,
  onSelectNext,
  onPlayPause,
  onReset,
  onDelete,
  onReplace,
}: {
  readonly hasGhost: boolean
  readonly pendingReplacement: boolean
  readonly replayView: ReplayInstrumentView
  readonly onSelectNext: () => void
  readonly onPlayPause: () => void
  readonly onReset: () => void
  readonly onDelete: () => void
  readonly onReplace: () => void
}) {
  const [deleteState, setDeleteState] =
    useState<DeliberateActionState>('latched')
  const progressRef = useRef<Mesh>(null)
  const statusMaterialRef = useRef<MeshStandardMaterial>(null)
  useFrame(() => {
    const duration = replayView.durationSeconds
    const progress = duration <= 0 ? 0 : replayView.elapsedSeconds / duration
    if (progressRef.current !== null) {
      progressRef.current.scale.x = Math.max(0.001, Math.min(1, progress))
      progressRef.current.position.x =
        -0.26 + progressRef.current.scale.x * 0.26
    }
    const material = statusMaterialRef.current
    if (material !== null) {
      const color =
        replayView.status === 'playing'
          ? '#78cf70'
          : replayView.status === 'paused'
            ? '#f0a558'
            : replayView.status === 'ended'
              ? '#88a8c9'
              : '#53635f'
      material.color.set(color)
      material.emissive.set(color)
      material.emissiveIntensity = replayView.status === 'playing' ? 0.55 : 0.18
    }
  })
  const button = (
    x: number,
    color: string,
    action: () => void,
    enabled = true,
  ) => (
    <mesh
      position={[x, 0, 0]}
      onPointerDown={(event) => {
        event.stopPropagation()
        if (enabled) action()
      }}
    >
      <boxGeometry args={[0.11, 0.1, 0.05]} />
      <meshStandardMaterial
        color={enabled ? color : '#53635f'}
        roughness={0.55}
      />
    </mesh>
  )
  return (
    <group position={[0.14, 0, 0]}>
      <InstrumentLabel
        text={'SELECT'}
        width={0.1}
        height={0.04}
        position={[0, 0, 0.04]}
        color={'#102522'}
        fontScale={0.58}
      />
      <InstrumentLabel
        text={'PLAY'}
        width={0.1}
        height={0.04}
        position={[0.13, 0, 0.04]}
        color={'#102522'}
        fontScale={0.62}
      />
      <InstrumentLabel
        text={'RESET'}
        width={0.1}
        height={0.04}
        position={[0.26, 0, 0.04]}
        color={'#102522'}
        fontScale={0.58}
      />
      <InstrumentLabel
        text={'DELETE\nx2'}
        width={0.1}
        height={0.07}
        position={[0.39, 0, 0.04]}
        color={'#fff4ed'}
        fontScale={0.78}
      />
      {pendingReplacement ? (
        <InstrumentLabel
          text={'SAVE\nNEW'}
          width={0.1}
          height={0.07}
          position={[0.52, 0, 0.04]}
          color={'#38220a'}
          fontScale={0.78}
        />
      ) : null}
      {button(0, '#7bb8ad', onSelectNext, hasGhost)}
      {button(
        0.13,
        replayView.status === 'playing' ? '#f0a558' : '#78cf70',
        onPlayPause,
        hasGhost,
      )}
      {button(0.26, '#88a8c9', onReset, hasGhost)}
      {button(
        0.39,
        deleteState === 'armed' ? '#f06957' : '#a86b5e',
        () => {
          const transition = pressDeliberateAction(deleteState)
          setDeleteState(transition.state)
          if (transition.commit) onDelete()
        },
        hasGhost,
      )}
      {pendingReplacement ? button(0.52, '#ffbd59', onReplace) : null}
      <mesh position={[0.26, -0.09, 0]}>
        <boxGeometry args={[0.52, 0.022, 0.025]} />
        <meshStandardMaterial color={'#243936'} />
      </mesh>
      <mesh ref={progressRef} position={[0, -0.09, 0.018]}>
        <boxGeometry args={[0.52, 0.018, 0.018]} />
        <meshStandardMaterial color={'#7bb8ad'} />
      </mesh>
      <mesh position={[-0.08, 0, 0.045]}>
        <sphereGeometry args={[0.018, 10, 8]} />
        <meshStandardMaterial ref={statusMaterialRef} color={'#53635f'} />
      </mesh>
    </group>
  )
}

function digitSegmentPosition(segment: string): readonly [number, number] {
  switch (segment) {
    case 'a':
      return [0, 0.021]
    case 'd':
      return [0, -0.021]
    case 'g':
      return [0, 0]
    case 'b':
      return [0.014, 0.011]
    case 'c':
      return [0.014, -0.011]
    case 'e':
      return [-0.014, -0.011]
    default:
      return [-0.014, 0.011]
  }
}

function phaseLabel(phase: InstrumentationPhase): string {
  switch (phase) {
    case 'RAPID_MIX':
      return 'RAPID MIX'
    case 'FLOCCULATION':
      return 'SLOW MIX / FLOC'
    default:
      return phase
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}
