/**
 * Props every lesson scene receives.
 *
 * `t` is the normalised position in the scene's own timeline (0 = start,
 * 1 = end of one full loop). Scenes are pure functions of `t`, which makes
 * them scrubable, pauseable and testable.
 */
export interface SceneProps {
  /** Normalised timeline position, 0..1. */
  t: number
  /** True when the learner asked for the still / reduced-motion pose. */
  reduced: boolean
  /** Unique id prefix for gradients, clips and filters. */
  uid: string
}
