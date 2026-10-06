/**
 * Pronunciation through the browser's built-in speech synthesis.
 * No audio files, no network requests, no API keys.
 */

export interface SpeakOptions {
  /** 0.5 – 1.5; the app uses a slightly slower rate for learners. */
  rate?: number
  pitch?: number
  lang?: string
}

export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  )
}

/** Prefer natural-sounding English voices when the platform offers them. */
function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  if (!isSpeechSupported()) return undefined
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return undefined
  const base = lang.split('-')[0]
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith(base))
  const pool = english.length > 0 ? english : voices
  const preferredNames = ['samantha', 'karen', 'daniel', 'google us english', 'google uk english']
  const preferred = pool.find((v) => preferredNames.some((n) => v.name.toLowerCase().includes(n)))
  return preferred ?? pool.find((v) => v.localService) ?? pool[0]
}

/**
 * Speak a phrase. Returns a promise that settles when speech ends (or
 * immediately when speech synthesis is unavailable).
 */
export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  if (!isSpeechSupported() || !text.trim()) return Promise.resolve()

  const { rate = 0.9, pitch = 1, lang = 'en-US' } = options
  const synth = window.speechSynthesis

  return new Promise((resolve) => {
    try {
      synth.cancel() // Never let two phrases overlap.
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = rate
      utterance.pitch = pitch
      const voice = pickVoice(lang)
      if (voice) utterance.voice = voice
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      synth.speak(utterance)
    } catch {
      resolve()
    }
  })
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}

/**
 * Voice lists load asynchronously in Chromium-based browsers; call this once on
 * mount so the first pronunciation already has a good voice available.
 */
export function warmUpVoices(): void {
  if (!isSpeechSupported()) return
  try {
    window.speechSynthesis.getVoices()
  } catch {
    /* ignore */
  }
}
