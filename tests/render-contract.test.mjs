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
  assert.match(source, /const RAW_WATER_FILL_COLOR = '#220600'/)
  assert.match(source, /const CLEARED_WATER_COLOR = new Color\('#ffd68a'\)/)
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
  assert.match(source, /CANONICAL_JAR_DOSES\.map\(\(dose, index\)/)
  assert.match(
    source,
    /position=\{\[\(index - 2\.5\) \* 0\.25, 0\.58, 0\.08\]\}/,
  )
  assert.match(source, /transparent[\s\S]*opacity=\{0\.82\}/)
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

test('plant environment stays render-only and bounds its animated work', async () => {
  const source = await readFile(
    new URL('../src/render/PlantEnvironment.tsx', import.meta.url),
    'utf8',
  )
  const frameCallback = source.slice(source.indexOf('useFrame('))

  assert.doesNotMatch(source, /\.\.\/sim|SimulationRuntime|useState/)
  assert.equal((source.match(/<instancedMesh\b/g) ?? []).length, 4)
  assert.match(source, /deltaSeconds \* 0\.7/)
  assert.doesNotMatch(frameCallback, /new (?:Matrix4|Vector3|Array|Color)\b/)
  assert.doesNotMatch(source, /shadow|useTexture/)
  assert.match(source, /new DataTexture/)
  assert.match(source, /map=\{labSurfaceTexture\}/)
  assert.match(source, /labSurfaceTexture\.dispose\(\)/)
  assert.doesNotMatch(source, /Math\.random/)
  assert.doesNotMatch(frameCallback, /new (?:DataTexture|Uint8Array)\b/)
  assert.equal((source.match(/useLoader\(TextureLoader/g) ?? []).length, 1)
  assert.match(source, /import\.meta\.env\.BASE_URL/)
  assert.match(source, /side=\{BackSide\}/)
})

test('desktop and XR share the bounded Quest-safe lab lighting rig', async () => {
  const lighting = await readFile(
    new URL('../src/render/LabLighting.tsx', import.meta.url),
    'utf8',
  )
  const foundationScene = await readFile(
    new URL('../src/render/FoundationScene.tsx', import.meta.url),
    'utf8',
  )
  const xrScene = await readFile(
    new URL('../src/render/XrShellScene.tsx', import.meta.url),
    'utf8',
  )

  assert.equal((lighting.match(/<hemisphereLight\b/g) ?? []).length, 1)
  assert.equal((lighting.match(/<directionalLight\b/g) ?? []).length, 1)
  assert.doesNotMatch(lighting, /castShadow|shadowMap/)
  for (const scene of [foundationScene, xrScene]) {
    assert.match(scene, /<LabLighting \/>/)
    assert.doesNotMatch(scene, /<ambientLight\b|<directionalLight\b/)
  }
})

test('process audio remains app-owned, generated, bounded, and gesture gated', async () => {
  const audio = await readFile(
    new URL('../src/app/ProcessAudio.ts', import.meta.url),
    'utf8',
  )
  const muteButton = await readFile(
    new URL('../src/xr/AudioMuteButton.tsx', import.meta.url),
    'utf8',
  )

  assert.match(audio, /new AudioContext\(\)/)
  assert.match(audio, /createDeterministicNoiseBuffer/)
  assert.match(audio, /context\.sampleRate \* 2/)
  assert.doesNotMatch(audio, /fetch\(|\.mp3|\.wav|useFrame|setInterval/)
  assert.match(muteButton, /type: 'TOGGLE_MUTE'/)
  assert.doesNotMatch(muteButton, /\.\.\/sim|SimulationRuntime/)
})

test('operator controls share one physical dashboard with bounded scenery choices', async () => {
  const scene = await readFile(
    new URL('../src/render/XrShellScene.tsx', import.meta.url),
    'utf8',
  )
  const app = await readFile(
    new URL('../src/app/XrShellApp.tsx', import.meta.url),
    'utf8',
  )
  const dashboard = await readFile(
    new URL('../src/render/ControlDashboard.tsx', import.meta.url),
    'utf8',
  )
  const selector = await readFile(
    new URL('../src/xr/ScenerySelector.tsx', import.meta.url),
    'utf8',
  )

  assert.match(scene, /<ControlDashboard>\{children\}<\/ControlDashboard>/)
  assert.match(app, /<DoseLever[\s\S]*<StartButton[\s\S]*<ScenerySelector/)
  assert.match(dashboard, /position=\{\[-0\.35, 0, 0\]\}/)
  assert.match(dashboard, /boxGeometry args=\{\[1\.125, 0\.11, 0\.585\]\}/)
  assert.match(selector, /\(\['hetchy', 'sunol'\] as const\)/)
  assert.match(app, /text=\{'SET DOSE'\}/)
  assert.match(app, /text=\{'SCENERY'\}/)
  assert.doesNotMatch(
    dashboard + selector,
    /\.\.\/sim|SimulationRuntime|useFrame/,
  )
})

test('reference sources use same-tab navigation that cannot be popup-blocked', async () => {
  const app = await readFile(
    new URL('../src/app/XrShellApp.tsx', import.meta.url),
    'utf8',
  )
  const library = await readFile(
    new URL('../src/render/ReferenceLibrary.tsx', import.meta.url),
    'utf8',
  )

  assert.match(app, /window\.location\.assign\(sourceUrl\)/)
  assert.doesNotMatch(app, /window\.open\(sourceUrl/)
  assert.match(library, /label=\{'WEB'\}/)
})
