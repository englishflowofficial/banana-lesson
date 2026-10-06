/**
 * Tiny synthesised sound cues.
 *
 * These are generated with the Web Audio API instead of shipping audio files:
 * they stay small, need no licensing, and stay on-brand. Every cue is short,
 * soft and low-volume on purpose — the goal is a gentle nudge, not a fanfare.
 */

export type CueName = 'correct' | 'incorrect' | 'tap' | 'complete'

let context: AudioContext | null = null
let master: GainNode | null = null

type AudioContextConstructor = new () => AudioContext

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (context) return context
  const Ctor: AudioContextConstructor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext
  if (!Ctor) return null
  try {
    context = new Ctor()
    master = context.createGain()
    master.gain.value = 0.5
    master.connect(context.destination)
    return context
  } catch {
    return null
  }
}

interface ToneOptions {
  frequency: number
  /** Seconds from the start of the cue. */
  startAt: number
  duration: number
  type?: OscillatorType
  gain?: number
  /** Optional glide target for expressive cues. */
  glideTo?: number
}

function tone(ctx: AudioContext, opts: ToneOptions): void {
  const t0 = ctx.currentTime + opts.startAt
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = opts.type ?? 'triangle'
  osc.frequency.setValueAtTime(opts.frequency, t0)
  if (opts.glideTo) osc.frequency.exponentialRampToValueAtTime(opts.glideTo, t0 + opts.duration)

  const peak = opts.gain ?? 0.16
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(peak, t0 + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration)

  osc.connect(amp)
  if (master) amp.connect(master)
  else amp.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + opts.duration + 0.05)
}

const CUES: Record<CueName, (ctx: AudioContext) => void> = {
  // Warm rising triad — unmistakably "well done", never shrill.
  correct: (ctx) => {
    tone(ctx, { frequency: 523.25, startAt: 0, duration: 0.16, gain: 0.14 })
    tone(ctx, { frequency: 659.25, startAt: 0.09, duration: 0.18, gain: 0.13 })
    tone(ctx, { frequency: 783.99, startAt: 0.18, duration: 0.28, gain: 0.12, type: 'sine' })
  },
  // Soft descending two-note "hmm" — kind, not punishing.
  incorrect: (ctx) => {
    tone(ctx, { frequency: 311.13, startAt: 0, duration: 0.18, gain: 0.1, type: 'sine' })
    tone(ctx, {
      frequency: 246.94,
      startAt: 0.13,
      duration: 0.24,
      gain: 0.1,
      type: 'sine',
      glideTo: 220,
    })
  },
  tap: (ctx) => {
    tone(ctx, { frequency: 880, startAt: 0, duration: 0.05, gain: 0.05, type: 'sine' })
  },
  complete: (ctx) => {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(ctx, { frequency: f, startAt: i * 0.1, duration: 0.3, gain: 0.11, type: 'sine' })
    })
  },
}

/** Play a cue if sound is enabled and the browser allows it. */
export function playCue(name: CueName, enabled: boolean): void {
  if (!enabled) return
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined)
  }
  try {
    CUES[name](ctx)
  } catch {
    /* Audio is a nice-to-have: never let it break the lesson. */
  }
}

/** Browsers require a user gesture before audio can start. */
export function primeAudio(): void {
  const ctx = getContext()
  if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
}

export function isSoundSupported(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(
    window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext,
  )
}
