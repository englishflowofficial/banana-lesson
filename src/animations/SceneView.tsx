import { useEffect, useId, useRef } from 'react'
import { sceneRegistry, type AnimationKey } from './scenes'
import { useSceneClock } from './engine/useSceneClock'
import { usePrefersReducedMotion, useStoredFlag } from '../hooks/usePrefersReducedMotion'
import { MotionIcon, PauseIcon, PlayIcon, ReplayIcon, StepBackIcon, StepForwardIcon } from '../components/icons'

export interface SceneViewProps {
  animation: AnimationKey
  /** Full text description of the action, for screen readers and captions. */
  altText: string
  /** Short caption shown under the animation (e.g. "Peeling a banana"). */
  caption?: string
  className?: string
  showStepControls?: boolean
  /** Compact mode hides the progress bar and the still-image switch (hero use). */
  compact?: boolean
  /** Autoplay from the moment it mounts. */
  autoPlay?: boolean
}

const MOTION_STORAGE_KEY = 'actionEnglish:motionEnabled'

/**
 * Plays one lesson animation. Owns the timeline, the play/pause/replay
 * controls and the reduced-motion behaviour, so lesson pages only have to say
 * *which* animation to show.
 */
export function SceneView({
  animation,
  altText,
  caption,
  className = '',
  showStepControls = true,
  compact = false,
  autoPlay = true,
}: SceneViewProps) {
  const entry = sceneRegistry[animation]
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const prefersReduced = usePrefersReducedMotion()
  const [motionWanted, setMotionWanted] = useStoredFlag(MOTION_STORAGE_KEY, true)
  const motionEnabled = motionWanted && !prefersReduced

  const clock = useSceneClock({
    durationMs: entry.durationMs,
    autoPlay: motionEnabled && autoPlay,
  })

  const { pause, seek, play, replay } = clock
  const wasEnabled = useRef(motionEnabled)

  // Reduced motion / still mode shows one clear finished pose instead of motion.
  useEffect(() => {
    if (!motionEnabled) {
      pause()
      seek(entry.stillFrame)
    } else if (!wasEnabled.current) {
      replay()
    }
    wasEnabled.current = motionEnabled
  }, [motionEnabled, pause, seek, play, replay, entry.stillFrame])

  // Stop the timeline when the tab is hidden to save battery.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && clock.playing) clock.pause()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [clock])

  const Scene = entry.Component
  const titleId = `${uid}-scene-title`
  const descId = `${uid}-scene-desc`
  const progress = Math.round(clock.progress * 100)

  return (
    <figure className={`m-0 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl border border-cream-300 bg-cream-100 shadow-card">
        <svg
          viewBox="0 0 720 560"
          className="block h-auto w-full"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <title id={titleId}>{entry.label}</title>
          <desc id={descId}>{altText}</desc>
          <Scene t={clock.progress} reduced={!motionEnabled} uid={uid} />
        </svg>

        {caption && (
          <p className="pointer-events-none absolute inset-x-0 bottom-0 m-0 bg-linear-to-t from-cream-50/95 to-transparent px-4 pt-8 pb-2.5 text-center text-sm font-bold text-ink-600">
            {caption}
          </p>
        )}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="group" aria-label="Animation controls">
          <button
            type="button"
            onClick={clock.replay}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3.5 py-2 text-sm font-extrabold text-ink-700 shadow-pop transition hover:border-banana-400 hover:bg-banana-50 active:translate-y-px"
          >
            <ReplayIcon size={18} />
            Replay
          </button>
          <button
            type="button"
            onClick={clock.toggle}
            disabled={!motionEnabled}
            aria-pressed={clock.playing}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3.5 py-2 text-sm font-extrabold text-ink-700 shadow-pop transition hover:border-banana-400 hover:bg-banana-50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          >
            {clock.playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            {clock.playing ? 'Pause' : 'Play'}
          </button>

          {showStepControls && !clock.playing && (
            <>
              <button
                type="button"
                onClick={() => clock.step(-0.08)}
                disabled={!motionEnabled}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-white text-ink-700 shadow-pop transition hover:border-banana-400 hover:bg-banana-50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
                aria-label="Step animation back"
              >
                <StepBackIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => clock.step(0.08)}
                disabled={!motionEnabled}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-white text-ink-700 shadow-pop transition hover:border-banana-400 hover:bg-banana-50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
                aria-label="Step animation forward"
              >
                <StepForwardIcon size={18} />
              </button>
            </>
          )}
        </div>

        {!compact && (
        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-300 sm:w-36 sm:flex-none"
            role="progressbar"
            aria-label="Animation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-banana-500"
              style={{ width: `${Math.max(3, clock.progress * 100)}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setMotionWanted(!motionWanted)}
            disabled={prefersReduced}
            aria-pressed={!motionEnabled}
            title={
              prefersReduced
                ? 'Your device is set to reduce motion, so a still image is shown'
                : 'Switch between the full animation and a still image'
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-2 text-xs font-extrabold text-ink-600 shadow-pop transition hover:border-banana-400 hover:bg-banana-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MotionIcon size={16} />
            {motionEnabled ? 'Motion on' : 'Still image'}
          </button>
        </div>
        )}
      </figcaption>
    </figure>
  )
}
