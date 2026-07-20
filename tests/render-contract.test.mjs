import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('particle renderer is a read-only state consumer with one instanced mesh', async () => {
  const source = await readFile(
    new URL('../src/render/ParticleCloud.tsx', import.meta.url),
    'utf8',
  )
  const frameCallback = source.slice(source.indexOf('useFrame('))

  assert.equal((source.match(/<instancedMesh\b/g) ?? []).length, 1)
  assert.doesNotMatch(source, /useState/)
  assert.doesNotMatch(frameCallback, /new (?:Matrix4|Vector3|Array)\b/)
  assert.doesNotMatch(source, /(?:create|reset|step)Particle|FixedStepClock/)
  assert.match(source, /state: ParticleStateView/)
  assert.match(source, /state\.diameter\[index\]/)
  assert.match(source, /instanceMatrix\.needsUpdate = true/)
})

test('optical-load renderer uses two preallocated surfaces from one band authority', async () => {
  const source = await readFile(
    new URL('../src/render/OpticalLoadGradient.tsx', import.meta.url),
    'utf8',
  )
  const frameCallback = source.slice(source.indexOf('useFrame('))

  assert.equal((source.match(/<mesh\b/g) ?? []).length, 2)
  assert.match(source, /bands: OpticalLoadBandsPresentation/)
  assert.match(source, /readonly values: ArrayLike<number>/)
  assert.match(source, /new Uint8Array\(bands\.values\.length\)/)
  assert.match(source, /new DataTexture/)
  assert.match(source, /createGradientMaterial\(texture, 0\.42\)/)
  assert.doesNotMatch(
    frameCallback,
    /new (?:DataTexture|ShaderMaterial|Uint8Array)/,
  )
  assert.doesNotMatch(source, /endpointOpticalLoad|sampleOpticalLoadBands|Dose/)
})

test('jar-test bench has six static app-fed canonical summaries with no process ownership', async () => {
  const source = await readFile(
    new URL('../src/render/JarTestBench.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /\[0, 2, 4, 6, 8, 10\] as const/)
  assert.equal((source.match(/<instancedMesh\b/g) ?? []).length, 5)
  for (const refName of ['fillsRef', 'jarsRef', 'rimsRef', 'paddlesRef']) {
    assert.match(source, new RegExp(`ref=\\{${refName}\\}`))
  }
  assert.match(
    source,
    /ref=\{fillsRef\}[\s\S]*?CANONICAL_JAR_DOSES\.length[\s\S]*?RAW_WATER_FILL_DIMENSIONS/,
  )
  assert.match(source, /const RAW_WATER_FILL_COLOR = '#5b210a'/)
  assert.match(source, /const CLEARED_WATER_COLOR = new Color\('#d99a48'\)/)
  assert.match(source, /meshBasicMaterial[\s\S]*toneMapped=\{false\}/)
  assert.match(source, /fills\.setMatrixAt\(index, transform\)/)
  assert.match(source, /fills\.instanceMatrix\.needsUpdate = true/)
  assert.match(source, /fills\.setColorAt/)
  assert.doesNotMatch(source, /summaryTokensRef|octahedronGeometry/)
  assert.match(source, /summary\.displayClarity/)
  assert.match(source, /jarDisplayContrast\(summary\.displayClarity\)/)
  assert.match(source, /ref=\{tableLegsRef\}/)
  assert.match(source, /JAR_TEST_TABLETOP_HEIGHT_METERS/)
  assert.match(source, /JAR_VESSEL_DIMENSIONS/)
  assert.match(source, /JAR_RIM_DIMENSIONS/)
  assert.match(source, /text=\{'JAR TEST'\}/)
  assert.match(source, /DOSE {2}0 {5}2 {5}4 {5}6 {5}8 {4}10/)
  assert.doesNotMatch(source, /cylinderGeometry|torusGeometry/)
  assert.doesNotMatch(
    source,
    /useFrame|Particle|OpticalLoad|SimulationRuntime|FixedStep|TrialResult/,
  )
})

test('the hero tank contains no unlabeled sensor or prior-front line', async () => {
  const source = await readFile(
    new URL('../src/render/HeroObservationTank.tsx', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(source, /MeasurementCue|TreatmentGhostComparison/)
  assert.doesNotMatch(source, /measurementPhase|ghostComparisonView/)
})
