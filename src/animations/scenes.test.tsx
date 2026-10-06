import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { animationKeys, sceneRegistry } from './scenes'
import { sceneFrameSvg } from '../../tools/sceneFrames'
import {
  clamp,
  easeOutBack,
  easeOutCubic,
  lerp,
  morphContour,
  profile,
  resample,
  ribbonContour,
  rotatePt,
  smoothPath,
} from './engine/geometry'

const FRAMES = [0, 0.1, 0.25, 0.4, 0.5, 0.62, 0.75, 0.88, 1]

describe('geometry helpers', () => {
  it('clamps, interpolates and profiles without leaving the unit range', () => {
    expect(clamp(-3)).toBe(0)
    expect(clamp(3)).toBe(1)
    expect(lerp(0, 10, 0.25)).toBe(2.5)
    expect(profile(0, [[0, 1], [1, 5]])).toBe(1)
    expect(profile(1, [[0, 1], [1, 5]])).toBe(5)
    expect(Number.isNaN(profile(0.5, [[0, 1], [0.5, 3], [1, 5]]))).toBe(false)
  })

  it('eases into range endpoints', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutBack(0)).toBeCloseTo(0, 5)
    expect(easeOutBack(1)).toBeCloseTo(1, 5)
  })

  it('produces usable paths from organically shaped contours', () => {
    const contour = [
      { x: 0, y: 0 },
      { x: 10, y: 4 },
      { x: 20, y: 0 },
      { x: 10, y: -6 },
    ]
    const d = smoothPath(contour, true, 0.9)
    expect(d.startsWith('M')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    expect(d).not.toMatch(/NaN|Infinity/)
  })

  it('resamples and morphs any contour to the same point count', () => {
    const a = resample([{ x: 0, y: 0 }, { x: 100, y: 0 }], 12, false)
    expect(a).toHaveLength(12)
    const morphed = morphContour([{ x: 0, y: 0 }, { x: 4, y: 4 }], [{ x: 10, y: 10 }, { x: 20, y: 2 }], 0.5, 16)
    expect(morphed).toHaveLength(16)
    expect(morphed.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true)
  })

  it('rotates points around an origin', () => {
    const rotated = rotatePt({ x: 2, y: 0 }, { x: 0, y: 0 }, 90)
    expect(rotated.x).toBeCloseTo(0, 6)
    expect(rotated.y).toBeCloseTo(2, 6)
  })

  it('builds ribbons with a closed contour', () => {
    const contour = ribbonContour(
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }],
      (t) => 3 + t,
    )
    expect(contour).toHaveLength(6)
    expect(contour.every((p) => Number.isFinite(p.x))).toBe(true)
  })
})

describe('scene rendering', () => {
  it('registers a duration, still frame and label for every scene', () => {
    for (const key of animationKeys) {
      const entry = sceneRegistry[key]
      expect(entry.durationMs).toBeGreaterThan(1000)
      expect(entry.stillFrame).toBeGreaterThan(0)
      expect(entry.stillFrame).toBeLessThanOrEqual(1)
      expect(entry.label.length).toBeGreaterThan(3)
    }
  })

  it.each(animationKeys)('renders "%s" at every keyframe without NaN geometry', (key) => {
    const Scene = sceneRegistry[key].Component
    for (const t of FRAMES) {
      // Scenes always render inside an <svg> in the app, which is also what
      // tells React to use the SVG namespace for these element names.
      const markup = renderToStaticMarkup(
        <svg viewBox="0 0 720 560">
          <Scene t={t} reduced={false} uid={`test-${key}`} />
        </svg>,
      )
      expect(markup.length).toBeGreaterThan(2000)
      expect(markup).not.toMatch(/NaN/)
      expect(markup).not.toMatch(/undefined/)
      expect(markup).not.toMatch(/="Infinity"/)
    }
  })

  it.each(animationKeys)('renders "%s" as a complete standalone SVG', (key) => {
    const svg = sceneFrameSvg(key, sceneRegistry[key].stillFrame)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox="0 0 720 560"')
    expect(svg).toContain('</svg>')
    expect(svg).not.toMatch(/NaN/)
  })

  it('keeps the banana scene visually substantial at the still frame', () => {
    const svg = sceneFrameSvg('banana-peel', sceneRegistry['banana-peel'].stillFrame)
    const pathCount = (svg.match(/<path/g) ?? []).length
    expect(pathCount).toBeGreaterThan(20)
  })
})
