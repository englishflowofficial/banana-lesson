import { useCallback, useEffect, useState } from 'react'
import { usePrefersReducedMotion, useStoredFlag } from './usePrefersReducedMotion'

const SOUND_KEY = 'actionEnglish:soundEnabled'

/**
 * Sound preference shared by the whole app. Defaults to on, and always
 * remembers what the learner chose (including "off").
 */
export function useSoundPreference(): [boolean, (value: boolean) => void, () => void] {
  const [stored, setStored] = useStoredFlag(SOUND_KEY, true)
  const toggle = useCallback(() => setStored(!stored), [stored, setStored])
  return [stored, setStored, toggle]
}

export interface SpeechController {
  supported: boolean
  speaking: boolean
  say: (text: string, rate?: number) => void
  stop: () => void
}

/**
 * Small wrapper around the browser's speech synthesis with a `speaking` flag the
 * UI can use to pulse the speaker button.
 */
export function useSpeech(): SpeechController {
  const prefersReduced = usePrefersReducedMotion()
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const [module, setModule] = useState<typeof import('../lib/speech') | null>(null)

  useEffect(() => {
    let cancelled = false
    void import('../lib/speech').then((mod) => {
      if (cancelled) return
      setModule(mod)
      setSupported(mod.isSpeechSupported())
      mod.warmUpVoices()
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => () => module?.stopSpeaking(), [module])

  const say = useCallback(
    (text: string, rate = prefersReduced ? 1 : 0.88) => {
      if (!module) return
      setSpeaking(true)
      void module.speak(text, { rate }).then(() => setSpeaking(false))
    },
    [module, prefersReduced],
  )

  const stop = useCallback(() => {
    module?.stopSpeaking()
    setSpeaking(false)
  }, [module])

  return { supported, speaking, say, stop }
}
