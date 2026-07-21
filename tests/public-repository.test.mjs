import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('public repository has licensing, safety, contribution, plan authority, and current CI actions', async () => {
  const [license, readme, contributing, security, plan, architecture, ci] =
    await Promise.all([
      read('LICENSE'),
      read('README.md'),
      read('CONTRIBUTING.md'),
      read('SECURITY.md'),
      read('IMPLEMENTATION_PLAN.md'),
      read('docs/ARCHITECTURE.md'),
      read('.github/workflows/ci.yml'),
    ])

  assert.match(license, /^MIT License/)
  assert.match(readme, /drinking-water treatment/)
  assert.match(readme, /not dose-prediction software/)
  assert.match(contributing, /Do not submit real facility-sensitive material/)
  assert.match(security, /must not connect to SCADA/)
  assert.match(plan, /superseded Godot-era plan/)
  assert.match(architecture, /sim.*browser.*React.*Three\.js.*rendering.*XR/s)
  assert.match(ci, /actions\/checkout@v7/)
  assert.match(ci, /persist-credentials: false/)
  assert.match(ci, /actions\/setup-node@v7/)
})

test('session handoff identifies plan authority and released hosted evidence', async () => {
  const handoff = await read('HANDOFF.md')

  assert.match(handoff, /Active plan authority: \[IMPLEMENTATION_PLAN\.md\]/)
  assert.match(handoff, /local physical Quest route is accepted/)
  assert.match(handoff, /hosted HTTPS deployment is\s+authorized and live/)
  assert.match(handoff, /Hosted Quest entry/)
  assert.match(handoff, /Current milestone: `v0\.1\.0` released/)
  assert.match(handoff, /Narrated Quest demonstration/)
  assert.match(
    handoff,
    /release notes, and `v0\.1\.0` publication are complete/,
  )
  assert.match(handoff, /npm test/)
  assert.match(handoff, /Recommended next session/)
})

test('v0.1 public root and Pages deployment remain one bounded application', async () => {
  const [app, xrApp, vite, manifestSource, pages] = await Promise.all([
    read('src/app/App.tsx'),
    read('src/app/XrShellApp.tsx'),
    read('vite.config.ts'),
    read('package.json'),
    read('.github/workflows/pages.yml'),
  ])
  const manifest = JSON.parse(manifestSource)

  assert.match(app, /mode === null \|\| mode === 'xr-shell'/)
  assert.match(xrApp, /get\('panorama'\) === 'hetchy' \? 'hetchy' : 'sunol'/)
  assert.match(xrApp, /get\('posture'\) \?\? 'seated'/)
  assert.match(vite, /mode === 'pages' \? '\/Sunol-Flowlab-VR\/' : '\/'/)
  assert.equal(manifest.version, '0.1.0')
  assert.equal(
    manifest.scripts['build:pages'],
    'tsc -b && vite build --mode pages',
  )
  assert.match(pages, /npm run build:pages/)
  assert.match(pages, /actions\/configure-pages@[a-f0-9]{40}/)
  assert.match(pages, /actions\/upload-pages-artifact@[a-f0-9]{40}/)
  assert.match(pages, /actions\/deploy-pages@[a-f0-9]{40}/)
})
