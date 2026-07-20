import type { AppCommand } from './commands'
import type { TreatmentCycleRecord, TrialPhase } from './TreatmentCycle'

export type ProcessAudioFlavor = 'classic' | 'quiet' | 'warm'
export type ProcessAudioCommand = { readonly type: 'TOGGLE_MUTE' }

export interface PhaseAudioProfile {
  readonly humFrequencyHz: number
  readonly humGain: number
  readonly processFilterHz: number
  readonly processGain: number
  readonly roomGain: number
}

const CLASSIC_PHASE_PROFILES: Readonly<Record<TrialPhase, PhaseAudioProfile>> =
  Object.freeze({
    READY: profile(64, 0.0025, 260, 0, 0.0015),
    RAPID_MIX: profile(92, 0.006, 760, 0.012, 0.0015),
    FLOCCULATION: profile(72, 0.0045, 430, 0.006, 0.0015),
    SETTLING: profile(58, 0.0025, 240, 0.002, 0.0012),
    MEASURING: profile(66, 0.003, 320, 0.0015, 0.0012),
    COMPLETE: profile(64, 0.002, 260, 0, 0.0012),
    REFILLING: profile(78, 0.005, 620, 0.01, 0.0015),
  })

export function requireProcessAudioFlavor(
  value: string | null,
): ProcessAudioFlavor {
  return value === 'quiet' || value === 'warm' ? value : 'classic'
}

export function phaseAudioProfile(
  phase: TrialPhase,
  flavor: ProcessAudioFlavor,
): PhaseAudioProfile {
  const base = CLASSIC_PHASE_PROFILES[phase]
  if (flavor === 'quiet') return scaleProfile(base, 0.5, 1)
  if (flavor === 'warm') return scaleProfile(base, 0.8, 0.72)
  return base
}

export interface ProcessAudioSnapshot {
  readonly flavor: ProcessAudioFlavor
  readonly initialized: boolean
  readonly muted: boolean
  readonly phase: TrialPhase
}

type AudioContextFactory = () => AudioContext

export class ProcessAudioController {
  private context: AudioContext | null = null
  private detailRandomState = 0x9e3779b9
  private detailTimer: ReturnType<typeof setTimeout> | null = null
  private hum: OscillatorNode | null = null
  private humGain: GainNode | null = null
  private masterGain: GainNode | null = null
  private musicRandomState = 0x243f6a88
  private musicTimer: ReturnType<typeof setTimeout> | null = null
  private noiseBuffer: AudioBuffer | null = null
  private processFilter: BiquadFilterNode | null = null
  private processGain: GainNode | null = null
  private roomGain: GainNode | null = null
  private phase: TrialPhase = 'READY'
  private muted = false

  constructor(
    private readonly flavor: ProcessAudioFlavor,
    private readonly createContext: AudioContextFactory = () =>
      new AudioContext(),
  ) {}

  get snapshot(): ProcessAudioSnapshot {
    return Object.freeze({
      flavor: this.flavor,
      initialized: this.context !== null,
      muted: this.muted,
      phase: this.phase,
    })
  }

  unlock(): void {
    if (this.context === null) this.initialize()
    this.resume()
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    const context = this.context
    const masterGain = this.masterGain
    if (context === null || masterGain === null) return
    masterGain.gain.setTargetAtTime(muted ? 0 : 0.9, context.currentTime, 0.02)
    if (muted) {
      this.clearPhaseDetailTimer()
      this.clearMusicTimer()
    } else {
      this.schedulePhaseDetail()
      this.scheduleAmbientMusic()
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted)
    if (!this.muted) this.unlock()
    return this.muted
  }

  setPhase(phase: TrialPhase): void {
    this.phase = phase
    this.applyPhaseProfile()
    this.schedulePhaseDetail()
  }

  handleCommand(command: AppCommand): void {
    this.unlock()
    switch (command.type) {
      case 'SET_DOSE':
        this.playTone(620 + command.dose * 18, 0.035, 0.075, 'square')
        break
      case 'START_TRIAL':
        this.playTone(118, 0.13, 0.13, 'triangle')
        this.playTone(690, 0.045, 0.06, 'square', 0.025)
        break
      case 'RESET_TRIAL':
        this.playNoiseBurst(0.48, 0.085, 720)
        this.playBubble(150, 330, 0.22, 0.065, 0.05)
        break
      case 'CLEAR_EXPERIMENT_LOG':
        this.playNoiseBurst(0.14, 0.05, 1700)
        break
      case 'PLAY_GHOST':
      case 'PAUSE_GHOST':
      case 'RESET_GHOST':
        this.playTone(410, 0.05, 0.045, 'square')
        break
      default:
        break
    }
  }

  playDashboardClick(): void {
    this.unlock()
    this.playTone(540, 0.045, 0.055, 'square')
  }

  handleCycleRecord(record: TreatmentCycleRecord): void {
    if (!record.accepted) return
    this.setPhase(record.to)
    if (record.to === 'MEASURING') {
      this.playTone(880, 0.18, 0.08, 'sine')
      this.playTone(1320, 0.14, 0.045, 'sine', 0.08)
    } else if (record.to === 'COMPLETE') {
      this.playTone(520, 0.1, 0.05, 'sine')
    }
  }

  suspend(): void {
    this.clearPhaseDetailTimer()
    this.clearMusicTimer()
    const context = this.context
    if (context !== null && context.state === 'running')
      void context.suspend().catch(() => undefined)
  }

  resume(): void {
    const context = this.context
    if (context !== null && context.state === 'suspended')
      void context.resume().catch(() => undefined)
    this.schedulePhaseDetail()
    this.scheduleAmbientMusic()
  }

  dispose(): void {
    this.clearPhaseDetailTimer()
    this.clearMusicTimer()
    const context = this.context
    this.context = null
    this.hum = null
    this.humGain = null
    this.masterGain = null
    this.noiseBuffer = null
    this.processFilter = null
    this.processGain = null
    this.roomGain = null
    if (context !== null) void context.close().catch(() => undefined)
  }

  private initialize(): void {
    const context = this.createContext()
    const masterGain = context.createGain()
    masterGain.gain.value = this.muted ? 0 : 0.9
    masterGain.connect(context.destination)

    const noiseBuffer = createDeterministicNoiseBuffer(context)
    const roomSource = context.createBufferSource()
    const roomGain = context.createGain()
    roomSource.buffer = noiseBuffer
    roomSource.loop = true
    roomSource.connect(roomGain).connect(masterGain)
    roomSource.start()

    const processSource = context.createBufferSource()
    const processFilter = context.createBiquadFilter()
    const processGain = context.createGain()
    processSource.buffer = noiseBuffer
    processSource.loop = true
    processFilter.type = 'lowpass'
    processSource
      .connect(processFilter)
      .connect(processGain)
      .connect(masterGain)
    processSource.start()

    const hum = context.createOscillator()
    const humGain = context.createGain()
    hum.type = 'sine'
    hum.connect(humGain).connect(masterGain)
    hum.start()

    this.context = context
    this.hum = hum
    this.humGain = humGain
    this.masterGain = masterGain
    this.noiseBuffer = noiseBuffer
    this.processFilter = processFilter
    this.processGain = processGain
    this.roomGain = roomGain
    this.applyPhaseProfile()
    this.schedulePhaseDetail()
    this.scheduleAmbientMusic()
  }

  private applyPhaseProfile(): void {
    const context = this.context
    const hum = this.hum
    const humGain = this.humGain
    const processFilter = this.processFilter
    const processGain = this.processGain
    const roomGain = this.roomGain
    if (
      context === null ||
      hum === null ||
      humGain === null ||
      processFilter === null ||
      processGain === null ||
      roomGain === null
    )
      return
    const settings = phaseAudioProfile(this.phase, this.flavor)
    const now = context.currentTime
    hum.frequency.setTargetAtTime(settings.humFrequencyHz, now, 0.15)
    humGain.gain.setTargetAtTime(settings.humGain, now, 0.18)
    processFilter.frequency.setTargetAtTime(settings.processFilterHz, now, 0.18)
    processGain.gain.setTargetAtTime(settings.processGain, now, 0.18)
    roomGain.gain.setTargetAtTime(settings.roomGain, now, 0.18)
  }

  private playTone(
    frequencyHz: number,
    durationSeconds: number,
    gainValue: number,
    type: OscillatorType,
    delaySeconds = 0,
  ): void {
    const context = this.context
    const masterGain = this.masterGain
    if (context === null || masterGain === null || this.muted) return
    const start = context.currentTime + delaySeconds
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequencyHz
    gain.gain.setValueAtTime(gainValue, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSeconds)
    oscillator.connect(gain).connect(masterGain)
    oscillator.start(start)
    oscillator.stop(start + durationSeconds)
  }

  private playNoiseBurst(
    durationSeconds: number,
    gainValue: number,
    filterFrequencyHz: number,
  ): void {
    const context = this.context
    const masterGain = this.masterGain
    const noiseBuffer = this.noiseBuffer
    if (
      context === null ||
      masterGain === null ||
      noiseBuffer === null ||
      this.muted
    )
      return
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    source.buffer = noiseBuffer
    filter.type = 'lowpass'
    filter.frequency.value = filterFrequencyHz
    gain.gain.setValueAtTime(gainValue, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + durationSeconds,
    )
    source.connect(filter).connect(gain).connect(masterGain)
    source.start()
    source.stop(context.currentTime + durationSeconds)
  }

  private playBubble(
    startFrequencyHz: number,
    endFrequencyHz: number,
    durationSeconds: number,
    gainValue: number,
    delaySeconds = 0,
  ): void {
    const context = this.context
    const masterGain = this.masterGain
    if (context === null || masterGain === null || this.muted) return
    const start = context.currentTime + delaySeconds
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(startFrequencyHz, start)
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequencyHz,
      start + durationSeconds,
    )
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSeconds)
    oscillator.connect(gain).connect(masterGain)
    oscillator.start(start)
    oscillator.stop(start + durationSeconds)
  }

  private schedulePhaseDetail(): void {
    this.clearPhaseDetailTimer()
    const context = this.context
    if (context === null || this.muted || context.state === 'closed') return
    const [minimumSeconds, maximumSeconds] = phaseDetailDelay(this.phase)
    const delaySeconds =
      minimumSeconds +
      (maximumSeconds - minimumSeconds) * this.nextDetailRandom()
    this.detailTimer = setTimeout(() => {
      this.detailTimer = null
      this.playPhaseDetail()
      this.schedulePhaseDetail()
    }, delaySeconds * 1000)
  }

  private clearPhaseDetailTimer(): void {
    if (this.detailTimer === null) return
    clearTimeout(this.detailTimer)
    this.detailTimer = null
  }

  private playPhaseDetail(): void {
    const variation = this.nextDetailRandom()
    if (this.phase === 'RAPID_MIX') {
      this.playTone(330 + variation * 180, 0.035, 0.055, 'square')
      if (variation > 0.52)
        this.playBubble(135, 310 + variation * 100, 0.18, 0.05, 0.045)
    } else if (this.phase === 'FLOCCULATION') {
      this.playBubble(125 + variation * 45, 280 + variation * 90, 0.24, 0.06)
      if (variation > 0.68) this.playTone(245, 0.028, 0.035, 'triangle', 0.08)
    } else if (this.phase === 'SETTLING') {
      this.playBubble(105 + variation * 35, 235 + variation * 70, 0.3, 0.045)
    } else if (this.phase === 'REFILLING') {
      this.playBubble(145, 360 + variation * 120, 0.2, 0.07)
      this.playNoiseBurst(0.11, 0.035, 950)
    } else {
      this.playTone(205 + variation * 55, 0.025, 0.025, 'triangle')
    }
  }

  private nextDetailRandom(): number {
    this.detailRandomState =
      (Math.imul(this.detailRandomState, 1_664_525) + 1_013_904_223) >>> 0
    return this.detailRandomState / 0xffffffff
  }

  private scheduleAmbientMusic(): void {
    this.clearMusicTimer()
    const context = this.context
    if (context === null || this.muted || context.state === 'closed') return
    const delaySeconds = 3.2 + this.nextMusicRandom() * 3.6
    this.musicTimer = setTimeout(() => {
      this.musicTimer = null
      this.playAmbientPhrase()
      this.scheduleAmbientMusic()
    }, delaySeconds * 1000)
  }

  private clearMusicTimer(): void {
    if (this.musicTimer === null) return
    clearTimeout(this.musicTimer)
    this.musicTimer = null
  }

  private playAmbientPhrase(): void {
    const notes = [196, 220, 261.63, 293.66, 329.63] as const
    const index = Math.floor(this.nextMusicRandom() * notes.length)
    const gain =
      this.flavor === 'quiet' ? 0.012 : this.flavor === 'warm' ? 0.018 : 0.02
    const frequencyScale = this.flavor === 'warm' ? 0.86 : 1
    this.playAmbientNote(notes[index] * frequencyScale, 1.7, gain)
    this.playAmbientNote(
      notes[(index + 2) % notes.length] * frequencyScale,
      1.5,
      gain * 0.72,
      0.55,
    )
  }

  private playAmbientNote(
    frequencyHz: number,
    durationSeconds: number,
    gainValue: number,
    delaySeconds = 0,
  ): void {
    const context = this.context
    const masterGain = this.masterGain
    if (context === null || masterGain === null || this.muted) return
    const start = context.currentTime + delaySeconds
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequencyHz
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.18)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSeconds)
    oscillator.connect(gain).connect(masterGain)
    oscillator.start(start)
    oscillator.stop(start + durationSeconds)
  }

  private nextMusicRandom(): number {
    this.musicRandomState =
      (Math.imul(this.musicRandomState, 22_695_477) + 1) >>> 0
    return this.musicRandomState / 0xffffffff
  }
}

function profile(
  humFrequencyHz: number,
  humGain: number,
  processFilterHz: number,
  processGain: number,
  roomGain: number,
): PhaseAudioProfile {
  return Object.freeze({
    humFrequencyHz,
    humGain,
    processFilterHz,
    processGain,
    roomGain,
  })
}

function scaleProfile(
  base: PhaseAudioProfile,
  gainScale: number,
  frequencyScale: number,
): PhaseAudioProfile {
  return profile(
    base.humFrequencyHz * frequencyScale,
    base.humGain * gainScale,
    base.processFilterHz * frequencyScale,
    base.processGain * gainScale,
    base.roomGain * gainScale,
  )
}

function createDeterministicNoiseBuffer(context: AudioContext): AudioBuffer {
  const frameCount = context.sampleRate * 2
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const data = buffer.getChannelData(0)
  let state = 0x6d2b79f5
  for (let index = 0; index < data.length; index += 1) {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
    data[index] = (state / 0xffffffff) * 2 - 1
  }
  return buffer
}

function phaseDetailDelay(phase: TrialPhase): readonly [number, number] {
  switch (phase) {
    case 'RAPID_MIX':
      return [0.35, 0.9]
    case 'FLOCCULATION':
      return [0.9, 1.8]
    case 'SETTLING':
      return [1.6, 3.2]
    case 'REFILLING':
      return [0.32, 0.7]
    case 'MEASURING':
      return [1.2, 2]
    case 'READY':
    case 'COMPLETE':
      return [4.5, 8]
  }
}
