import { useCallback, useEffect, useRef, useState } from 'react'

export interface SceneClock {
  /** Normalised timeline position, 0..1. */
  progress: number
  playing: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  /** Restart from the beginning and play. */
  replay: () => void
  /** Jump to an absolute position (used by the still-frame stepper). */
  seek: (value: number) => void
  /** Step forward/back by `amount`, pausing playback. */
  step: (amount: number) => void
}

interface Options {
  durationMs: number
  /** Start playing as soon as the component mounts. */
  autoPlay?: boolean
}

/**
 * Drives a scene timeline with requestAnimationFrame and reports progress as
 * a normalised 0..1 value, so scenes can be written as pure functions of time.
 */
export function useSceneClock({ durationMs, autoPlay = true }: Options): SceneClock {
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)

  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const offsetRef = useRef(0)
  const progressRef = useRef(0)

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!playing) {
      stopRaf()
      return
    }
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const next = offsetRef.current + elapsed / durationMs
      if (next >= 1) {
        // Restart cleanly so the loop never drifts or stalls mid-peel.
        offsetRef.current = 0
        startRef.current = now
        progressRef.current = 0
        setProgress(0)
      } else {
        progressRef.current = next
        setProgress(next)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return stopRaf
  }, [playing, durationMs, stopRaf])

  const seek = useCallback(
    (value: number) => {
      const clamped = Math.min(1, Math.max(0, value))
      offsetRef.current = clamped
      progressRef.current = clamped
      startRef.current = performance.now()
      setProgress(clamped)
    },
    [],
  )

  const play = useCallback(() => {
    offsetRef.current = progressRef.current >= 1 ? 0 : progressRef.current
    startRef.current = performance.now()
    setPlaying(true)
  }, [])

  const pause = useCallback(() => setPlaying(false), [])

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (p) return false
      offsetRef.current = progressRef.current >= 1 ? 0 : progressRef.current
      startRef.current = performance.now()
      return true
    })
  }, [])

  const replay = useCallback(() => {
    offsetRef.current = 0
    progressRef.current = 0
    startRef.current = performance.now()
    setProgress(0)
    setPlaying(true)
  }, [])

  const step = useCallback(
    (amount: number) => {
      setPlaying(false)
      const next = Math.min(1, Math.max(0, progressRef.current + amount))
      offsetRef.current = next
      progressRef.current = next
      setProgress(next)
    },
    [],
  )

  return { progress, playing, play, pause, toggle, replay, seek, step }
}
