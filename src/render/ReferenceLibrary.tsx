import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  CanvasTexture,
  Color,
  InstancedMesh,
  LinearFilter,
  Matrix4,
  SRGBColorSpace,
  type Vector3,
} from 'three'

import { InstrumentLabel } from './InstrumentLabel'

interface ReferencePagePresentation {
  readonly heading: string
  readonly body: string
}

export interface ReferenceBookPresentation {
  readonly id: string
  readonly shortTitle: string
  readonly title: string
  readonly color: string
  readonly source: {
    readonly label: string
    readonly url: string
  }
  readonly pages: readonly ReferencePagePresentation[]
}

interface ReferenceLibraryProps {
  readonly books: readonly ReferenceBookPresentation[]
  readonly selectedBookId: string | null
  readonly pageIndex: number
  readonly close: () => void
  readonly next: () => void
  readonly openBook: (bookId: string) => void
  readonly openSource: (sourceUrl: string) => void
  readonly previous: () => void
}

const BOOK_X_POSITIONS = [-0.45, -0.15, 0.15, 0.45] as const
const BOOK_Z_ROTATIONS = [-0.035, 0.018, -0.012, 0.032] as const

const BOOKCASE_PARTS = [
  { position: [0, 0.75, -0.13], scale: [1.42, 1.58, 0.08] },
  { position: [-0.69, 0.75, 0], scale: [0.1, 1.66, 0.4] },
  { position: [0.69, 0.75, 0], scale: [0.1, 1.66, 0.4] },
  { position: [0, -0.03, 0], scale: [1.46, 0.12, 0.44] },
  { position: [0, 0.72, 0], scale: [1.32, 0.09, 0.4] },
  { position: [0, 1.53, 0], scale: [1.46, 0.12, 0.44] },
  { position: [-0.52, -0.15, 0], scale: [0.16, 0.18, 0.34] },
  { position: [0.52, -0.15, 0], scale: [0.16, 0.18, 0.34] },
] as const

const LOWER_SHELF_BOOKS = [
  { x: -0.49, height: 0.48, width: 0.15, color: '#6f553b' },
  { x: -0.33, height: 0.44, width: 0.13, color: '#3f625b' },
  { x: -0.18, height: 0.5, width: 0.14, color: '#80673f' },
  { x: 0.02, height: 0.42, width: 0.18, color: '#485f72' },
  { x: 0.23, height: 0.47, width: 0.16, color: '#76504b' },
  { x: 0.43, height: 0.45, width: 0.18, color: '#4e6643' },
] as const

export function ReferenceLibrary({
  books,
  selectedBookId,
  pageIndex,
  close,
  next,
  openBook,
  openSource,
  previous,
}: ReferenceLibraryProps) {
  const selectedBook =
    selectedBookId === null
      ? null
      : (books.find((book) => book.id === selectedBookId) ?? null)

  return (
    <>
      <group position={[-2.15, 0.2, 0.15]} rotation={[0, 1.4, 0]}>
        <BookcaseShell />
        <mesh position={[0, 1.39, 0.22]}>
          <boxGeometry args={[1.12, 0.18, 0.04]} />
          <meshStandardMaterial
            color={'#d4b977'}
            emissive={'#6a542b'}
            emissiveIntensity={0.3}
            roughness={0.58}
          />
        </mesh>
        <InstrumentLabel
          text={'REFERENCE LIBRARY'}
          width={1.02}
          height={0.12}
          position={[0, 1.39, 0.242]}
          background={'#25443f'}
          color={'#fff7dd'}
          fontScale={0.5}
        />
        {books.map((book, index) => (
          <ReferenceBookMesh
            key={book.id}
            book={book}
            position={[BOOK_X_POSITIONS[index], 0.98, 0.13]}
            rotationZ={BOOK_Z_ROTATIONS[index]}
            selected={book.id === selectedBookId}
            select={() => openBook(book.id)}
          />
        ))}
        <LowerShelfBookRow />
        <InstrumentLabel
          text={'LAB NOTES'}
          width={0.44}
          height={0.08}
          position={[0.34, 0.13, 0.225]}
          background={'#d7c69e'}
          color={'#35413e'}
          fontScale={0.48}
        />
      </group>
      {selectedBook === null ? null : (
        <ReferenceReader
          book={selectedBook}
          close={close}
          next={next}
          openSource={() => openSource(selectedBook.source.url)}
          pageIndex={pageIndex}
          previous={previous}
        />
      )}
    </>
  )
}

function BookcaseShell() {
  const instanceRef = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Matrix4(), [])

  useLayoutEffect(() => {
    const instances = instanceRef.current
    if (instances === null) return
    for (let index = 0; index < BOOKCASE_PARTS.length; index += 1) {
      const part = BOOKCASE_PARTS[index]
      transform.makeScale(part.scale[0], part.scale[1], part.scale[2])
      transform.setPosition(
        part.position[0],
        part.position[1],
        part.position[2],
      )
      instances.setMatrixAt(index, transform)
    }
    instances.instanceMatrix.needsUpdate = true
  }, [transform])

  return (
    <instancedMesh
      ref={instanceRef}
      args={[undefined, undefined, BOOKCASE_PARTS.length]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={'#946e49'}
        emissive={'#694627'}
        emissiveIntensity={0.32}
        roughness={0.78}
      />
    </instancedMesh>
  )
}

function LowerShelfBookRow() {
  const instanceRef = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Matrix4(), [])

  useLayoutEffect(() => {
    const instances = instanceRef.current
    if (instances === null) return
    for (let index = 0; index < LOWER_SHELF_BOOKS.length; index += 1) {
      const book = LOWER_SHELF_BOOKS[index]
      transform.makeScale(book.width, book.height, 0.22)
      transform.setPosition(book.x, 0.02 + book.height / 2, 0.08)
      instances.setMatrixAt(index, transform)
      instances.setColorAt(index, new Color(book.color))
    }
    instances.instanceMatrix.needsUpdate = true
    if (instances.instanceColor !== null)
      instances.instanceColor.needsUpdate = true
  }, [transform])

  return (
    <instancedMesh
      ref={instanceRef}
      args={[undefined, undefined, LOWER_SHELF_BOOKS.length]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={'#ffffff'}
        emissive={'#435039'}
        emissiveIntensity={0.3}
        roughness={0.72}
      />
    </instancedMesh>
  )
}

function ReferenceBookMesh({
  book,
  position,
  rotationZ,
  selected,
  select,
}: {
  readonly book: ReferenceBookPresentation
  readonly position: readonly [number, number, number]
  readonly rotationZ: number
  readonly selected: boolean
  readonly select: () => void
}) {
  return (
    <group
      position={position as unknown as Vector3}
      rotation={[0, 0, rotationZ]}
      onPointerDown={(event) => activate(event, select)}
      onPointerEnter={() => setPointerCursor(true)}
      onPointerLeave={() => setPointerCursor(false)}
    >
      <mesh scale={selected ? 1.07 : 1}>
        <boxGeometry args={[0.26, 0.43, 0.085]} />
        <meshStandardMaterial
          color={book.color}
          emissive={book.color}
          emissiveIntensity={selected ? 0.45 : 0.25}
          roughness={0.72}
        />
      </mesh>
      <mesh position={[0.119, -0.005, 0.002]}>
        <boxGeometry args={[0.022, 0.35, 0.076]} />
        <meshStandardMaterial
          color={'#f0e5c7'}
          emissive={'#594f38'}
          emissiveIntensity={0.22}
          roughness={0.92}
        />
      </mesh>
      <InstrumentLabel
        text={book.shortTitle}
        width={0.21}
        height={0.3}
        position={[-0.007, 0, 0.044]}
        background={'#213b37'}
        color={'#fff4d8'}
        fontScale={0.42}
      />
    </group>
  )
}

function ReferenceReader({
  book,
  close,
  next,
  openSource,
  pageIndex,
  previous,
}: {
  readonly book: ReferenceBookPresentation
  readonly close: () => void
  readonly next: () => void
  readonly openSource: () => void
  readonly pageIndex: number
  readonly previous: () => void
}) {
  const page = book.pages[pageIndex]
  const texture = useMemo(
    () => createReaderTexture(book.title, page.heading, page.body),
    [book.title, page.body, page.heading],
  )
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={[0, 1.57, -1.1]} scale={1.15}>
      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[1.62, 1.05, 0.07]} />
        <meshStandardMaterial color={'#203431'} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.03, 0.004]}>
        <planeGeometry args={[1.5, 0.86]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <ReaderButton
        label={'BACK'}
        position={[-0.59, -0.44, 0.02]}
        activate={previous}
        disabled={pageIndex === 0}
      />
      <ReaderButton
        label={`${pageIndex + 1} / ${book.pages.length}`}
        position={[-0.2, -0.44, 0.02]}
        activate={() => undefined}
        disabled
      />
      <ReaderButton
        label={'NEXT'}
        position={[0.2, -0.44, 0.02]}
        activate={next}
        disabled={pageIndex === book.pages.length - 1}
      />
      <ReaderButton
        label={'WEB'}
        position={[0.58, -0.44, 0.02]}
        activate={openSource}
      />
      <ReaderButton
        label={'CLOSE'}
        position={[0.67, 0.46, 0.02]}
        activate={close}
        compact
      />
      <InstrumentLabel
        text={book.source.label}
        width={1.3}
        height={0.055}
        position={[-0.04, -0.365, 0.015]}
        color={'#b9d8d2'}
        fontScale={0.48}
      />
    </group>
  )
}

function ReaderButton({
  activate: activateButton,
  compact = false,
  disabled = false,
  label,
  position,
}: {
  readonly activate: () => void
  readonly compact?: boolean
  readonly disabled?: boolean
  readonly label: string
  readonly position: readonly [number, number, number]
}) {
  const width = compact ? 0.22 : 0.31
  return (
    <group
      position={position as unknown as Vector3}
      onPointerDown={(event) => {
        if (!disabled) activate(event, activateButton)
      }}
      onPointerEnter={() => {
        if (!disabled) setPointerCursor(true)
      }}
      onPointerLeave={() => setPointerCursor(false)}
    >
      <mesh>
        <boxGeometry args={[width, 0.115, 0.045]} />
        <meshStandardMaterial
          color={disabled ? '#40504d' : '#557c74'}
          roughness={0.65}
        />
      </mesh>
      <InstrumentLabel
        text={label}
        width={width * 0.88}
        height={0.072}
        position={[0, 0, 0.024]}
        color={disabled ? '#84928f' : '#f4fff9'}
        fontScale={0.58}
      />
    </group>
  )
}

function activate(event: ThreeEvent<PointerEvent>, action: () => void): void {
  event.stopPropagation()
  action()
}

function setPointerCursor(active: boolean): void {
  document.body.style.cursor = active ? 'pointer' : 'default'
}

function createReaderTexture(title: string, heading: string, body: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 880
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas text rendering is unavailable')

  context.fillStyle = '#f3eddd'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#315b56'
  context.fillRect(0, 0, canvas.width, 138)
  context.fillStyle = '#f7fff9'
  context.font = '700 62px Arial, sans-serif'
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillText(title, 68, 72, canvas.width - 136)

  context.fillStyle = '#243a37'
  context.font = '700 52px Arial, sans-serif'
  context.textBaseline = 'top'
  context.fillText(heading, 72, 190, canvas.width - 144)
  context.font = '400 39px Arial, sans-serif'
  drawWrappedText(context, body, 72, 285, canvas.width - 144, 58)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maximumWidth: number,
  lineHeight: number,
): void {
  const words = text.split(/\s+/)
  let line = ''
  let baseline = y
  for (const word of words) {
    const candidate = line.length === 0 ? word : `${line} ${word}`
    if (context.measureText(candidate).width <= maximumWidth) {
      line = candidate
      continue
    }
    context.fillText(line, x, baseline)
    line = word
    baseline += lineHeight
  }
  if (line.length > 0) context.fillText(line, x, baseline)
}
