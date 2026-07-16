import { type DoseDetent } from './doseEfficiency'
import {
  DEFAULT_PHENOMENON_CONFIG,
  createPhenomenonWorkspace,
  hashPhenomenonConfig,
  runPhenomenonTrial,
  type PhenomenonConfig,
  type PhenomenonTrialResult,
} from './phenomenon'

export const ALL_DOSE_DETENTS: readonly DoseDetent[] = Object.freeze([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
])

export interface DoseSweepReport {
  readonly schemaVersion: 1
  readonly seed: number
  readonly configHash: string
  readonly fixedTimestepSeconds: number
  readonly phaseDurationsSeconds: readonly [number, number, number, number]
  readonly results: readonly PhenomenonTrialResult[]
  readonly minimumDose: DoseDetent
  readonly minimumOpticalLoad: number
  readonly tailMargins: readonly [number, number]
  readonly leftShoulderReversals: number
  readonly rightShoulderReversals: number
  readonly maximumShoulderReversal: number
  readonly runtimeMs: number
  readonly failures: readonly string[]
}

export function runDoseSweep(
  seed: number,
  order: readonly DoseDetent[] = ALL_DOSE_DETENTS,
  config: Readonly<PhenomenonConfig> = DEFAULT_PHENOMENON_CONFIG,
  now: () => number = () => performance.now(),
): DoseSweepReport {
  validateSweepOrder(order)
  const workspace = createPhenomenonWorkspace(config)
  const results = new Array<PhenomenonTrialResult>(11)
  const startedAt = now()
  for (const dose of order)
    results[dose] = runPhenomenonTrial(dose, seed, config, workspace)
  const runtimeMs = now() - startedAt
  return analyzeDoseSweep(results, seed, config, runtimeMs)
}

export function formatDoseSweepMarkdown(report: DoseSweepReport): string {
  const lines = [
    '| Dose | Endpoint | Settled | Mean size | Clear time |',
    '| ---: | -------: | ------: | --------: | ---------: |',
  ]
  for (const result of report.results)
    lines.push(
      `| ${result.dose} | ${result.endpointOpticalLoad.toFixed(6)} | ${result.settledParticles} | ${result.meanNormalizedSize.toFixed(6)} | ${result.clarityReachedAtSimulationTime?.toFixed(3) ?? 'never'} |`,
    )
  return lines.join('\n')
}

export function formatDoseSweepFailure(report: DoseSweepReport): string {
  return JSON.stringify(report)
}

function analyzeDoseSweep(
  results: readonly PhenomenonTrialResult[],
  seed: number,
  config: Readonly<PhenomenonConfig>,
  runtimeMs: number,
): DoseSweepReport {
  let minimumDose: DoseDetent = 0
  for (let dose = 1; dose <= 10; dose += 1)
    if (
      results[dose].endpointOpticalLoad <
      results[minimumDose].endpointOpticalLoad
    )
      minimumDose = dose as DoseDetent
  const minimumOpticalLoad = results[minimumDose].endpointOpticalLoad
  const tailMargins: readonly [number, number] = [
    results[0].endpointOpticalLoad - minimumOpticalLoad,
    results[10].endpointOpticalLoad - minimumOpticalLoad,
  ]
  let leftShoulderReversals = 0
  let rightShoulderReversals = 0
  let maximumShoulderReversal = 0
  for (let dose = 1; dose <= minimumDose; dose += 1) {
    const reversal =
      results[dose].endpointOpticalLoad - results[dose - 1].endpointOpticalLoad
    if (reversal > 0) {
      leftShoulderReversals += 1
      maximumShoulderReversal = Math.max(maximumShoulderReversal, reversal)
    }
  }
  for (let dose = minimumDose + 1; dose <= 10; dose += 1) {
    const reversal =
      results[dose - 1].endpointOpticalLoad - results[dose].endpointOpticalLoad
    if (reversal > 0) {
      rightShoulderReversals += 1
      maximumShoulderReversal = Math.max(maximumShoulderReversal, reversal)
    }
  }

  const failures: string[] = []
  if (Math.abs(minimumDose - config.doseEfficiency.optimumDose) > 1)
    failures.push('minimum dose is outside the configured optimum tolerance')
  if (tailMargins[0] < 0.15 || tailMargins[1] < 0.15)
    failures.push('one or both endpoint tail margins are below 0.15')
  if (leftShoulderReversals > 1 || rightShoulderReversals > 1)
    failures.push('dose response has more than one shoulder reversal per side')
  if (maximumShoulderReversal > 0.03)
    failures.push('dose response shoulder reversal exceeds 0.03')
  if (
    results[config.doseEfficiency.optimumDose]
      .clarityReachedAtSimulationTime === null
  )
    failures.push('configured optimum never reaches upper-column clarity')
  if (
    results[0].clarityReachedAtSimulationTime !== null ||
    results[10].clarityReachedAtSimulationTime !== null
  )
    failures.push('an extreme reaches the upper-column clarity threshold')
  if (results.some((result) => !trialIsFiniteAndBounded(result)))
    failures.push('one or more trial outputs are non-finite or out of bounds')

  const c = config.coagulation
  return {
    schemaVersion: 1,
    seed,
    configHash: hashPhenomenonConfig(config),
    fixedTimestepSeconds: config.fixedTimestepSeconds,
    phaseDurationsSeconds: [
      c.rapidMixSeconds,
      c.flocculationSeconds,
      c.settlingSeconds,
      c.measurementSeconds,
    ],
    results,
    minimumDose,
    minimumOpticalLoad,
    tailMargins,
    leftShoulderReversals,
    rightShoulderReversals,
    maximumShoulderReversal,
    runtimeMs,
    failures,
  }
}

function trialIsFiniteAndBounded(result: PhenomenonTrialResult): boolean {
  if (
    !Number.isFinite(result.endpointOpticalLoad) ||
    result.endpointOpticalLoad < 0 ||
    result.endpointOpticalLoad > 1 ||
    !Number.isFinite(result.meanNormalizedSize) ||
    result.meanNormalizedSize <= 0 ||
    result.meanNormalizedSize > 1
  )
    return false
  for (const value of result.bandSnapshot)
    if (!Number.isFinite(value) || value < 0 || value > 1) return false
  return true
}

function validateSweepOrder(order: readonly DoseDetent[]): void {
  if (order.length !== 11)
    throw new RangeError('Dose sweep order must contain all eleven detents')
  let seen = 0
  for (const dose of order) {
    if (!Number.isInteger(dose) || dose < 0 || dose > 10)
      throw new RangeError('Dose sweep contains an invalid detent')
    const bit = 1 << dose
    if ((seen & bit) !== 0)
      throw new RangeError('Dose sweep order contains a duplicate detent')
    seen |= bit
  }
  if (seen !== 0x7ff)
    throw new RangeError('Dose sweep order must contain all eleven detents')
}
