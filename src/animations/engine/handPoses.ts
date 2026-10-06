/**
 * Finger-pose presets for the shared `Hand` component.
 *
 * Kept in their own module so the hand stays a pure component (which also keeps
 * React Fast Refresh working) and so scenes can share poses consistently.
 *
 * Each preset is [index, middle, ring, pinky] curl: 0 = straight, 1 = closed.
 */

/** Fingers loosely closed around a slim object (banana stem, jug handle). */
export const GRIP: [number, number, number, number] = [0.78, 0.84, 0.86, 0.9]

/** Fingers almost straight with the thumb pressing down on a stem. */
export const PRESS: [number, number, number, number] = [0.5, 0.58, 0.62, 0.7]

/** Relaxed open hand. */
export const OPEN: [number, number, number, number] = [0.06, 0.1, 0.16, 0.26]

/** One index finger extended, the rest tucked in — used for pointing. */
export const POINT: [number, number, number, number] = [0.05, 0.9, 0.92, 0.94]
