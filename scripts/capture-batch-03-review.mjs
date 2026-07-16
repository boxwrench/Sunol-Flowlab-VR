import { randomInt } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { chromium } from 'playwright'

const baseUrl = process.env.FLOWLAB_REVIEW_URL ?? 'http://127.0.0.1:5173'
const outputDirectory = fileURLToPath(
  new URL('../docs/evidence/batch-03-review/', import.meta.url),
)
const privateKeyPath = fileURLToPath(
  new URL('../test-results/batch-03-review-key.local', import.meta.url),
)
const letters = ['A', 'B', 'C']

function shuffledDoses() {
  const doses = [0, 5, 10]
  for (let index = doses.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1)
    ;[doses[index], doses[swapIndex]] = [doses[swapIndex], doses[index]]
  }
  return doses
}

async function waitForRender(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
  await page.waitForTimeout(400)
}

async function presentationCompletenessScore(page, screenshot) {
  return page.evaluate(async (encodedScreenshot) => {
    const response = await fetch(`data:image/png;base64,${encodedScreenshot}`)
    const image = await createImageBitmap(await response.blob())
    const canvas = new OffscreenCanvas(image.width, image.height)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, image.width, image.height).data
    const regions = [
      { left: 80, right: 280, top: 150, bottom: 430 },
      { left: 0, right: image.width, top: 440, bottom: image.height },
    ]
    let score = 0

    for (const region of regions) {
      for (let y = region.top; y < region.bottom; y += 4) {
        for (let x = region.left; x < region.right; x += 4) {
          const offset = (y * image.width + x) * 4
          score += pixels[offset] + pixels[offset + 1] + pixels[offset + 2]
        }
      }
    }

    image.close()
    return score
  }, screenshot.toString('base64'))
}

function observeBrowserErrors(page, browserErrors) {
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
}

async function captureCompletePresentation(
  browser,
  browserErrors,
  setupPage,
  outputPath,
) {
  let bestScreenshot
  let bestScore = -1
  let scenarioState

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    })
    observeBrowserErrors(page, browserErrors)
    try {
      const nextState = await setupPage(page)
      if (scenarioState === undefined) scenarioState = nextState
      await waitForRender(page)
      const screenshot = await page.screenshot()
      const score = await presentationCompletenessScore(page, screenshot)
      if (score <= bestScore) continue
      bestScreenshot = screenshot
      bestScore = score
    } finally {
      await page.close()
    }
  }

  if (bestScreenshot === undefined) {
    throw new Error('No complete presentation screenshot was captured')
  }
  await writeFile(outputPath, bestScreenshot)
  return scenarioState
}

const browser = await chromium.launch({ headless: true })
const browserErrors = []

try {
  await mkdir(outputDirectory, { recursive: true })
  await mkdir(path.dirname(privateKeyPath), { recursive: true })

  await captureCompletePresentation(
    browser,
    browserErrors,
    async (page) => {
      await page.goto(`${baseUrl}/?mode=proof`, {
        waitUntil: 'domcontentloaded',
      })
      await page.locator('canvas').waitFor({ state: 'visible' })
    },
    path.join(outputDirectory, 'apparatus-unlabeled.png'),
  )

  const key = {
    capturedAt: new Date().toISOString(),
    sourceUrl: baseUrl,
    comparisons: {},
  }
  const doses = shuffledDoses()

  for (let index = 0; index < doses.length; index += 1) {
    const dose = doses[index]
    const letter = letters[index]
    const state = await captureCompletePresentation(
      browser,
      browserErrors,
      async (page) => {
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
        await page.locator(`#preset-${dose}`).click()
        await page.evaluate(() => window.advanceTime?.(43_000))
        await waitForRender(page)

        const nextState = JSON.parse(
          await page.evaluate(() => window.render_game_to_text?.() ?? '{}'),
        )
        if (nextState.phase !== 'complete') {
          throw new Error(
            `Comparison ${letter} did not reach the complete phase`,
          )
        }

        await page.addStyleTag({
          content: `
            .app-heading,
            .comparison-controls,
            [aria-label='Development performance metrics'] {
              display: none !important;
            }
          `,
        })
        return nextState
      },
      path.join(outputDirectory, `comparison-${letter.toLowerCase()}.png`),
    )

    key.comparisons[letter] = {
      dose: state.dose,
      endpointOpticalLoad: state.endpointOpticalLoad,
      globalRelativeOpticalLoad: state.globalRelativeOpticalLoad,
      topClearFraction: state.topClearFraction,
      clearingFrontDepth: state.clearingFrontDepth,
      upperZoneOpticalLoad: state.upperZoneOpticalLoad,
    }
  }

  if (browserErrors.length > 0) {
    throw new Error(
      `Browser errors during capture:\n${browserErrors.join('\n')}`,
    )
  }

  await writeFile(privateKeyPath, `${JSON.stringify(key, null, 2)}\n`)
  console.log(
    'Batch 03 review captures created; the ignored local answer key is in test-results.',
  )
} finally {
  await browser.close()
}
