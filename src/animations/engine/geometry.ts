/**
 * Geometry helpers for the programmatic SVG animation system.
 *
 * Everything the scenes draw is generated from numbers, so a scene can be
 * "scrubbed" to any point in time and morphed between key poses. No bitmap
 * assets, nothing copyrighted, everything editable in version control.
 */

export interface Pt {
  x: number
  y: number
}

export const clamp = (v: number, min = 0, max = 1): number => (v < min ? min : v > max ? max : v)

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
})

export const invLerp = (a: number, b: number, v: number): number => (a === b ? 0 : (v - a) / (b - a))

/** Normalised 0..1 position of `t` inside the window [from, to]. */
export const segment = (t: number, from: number, to: number): number => clamp(invLerp(from, to, t))

/** Same as `segment` but with an easing curve applied. */
export const seg = (
  t: number,
  from: number,
  to: number,
  easing: (x: number) => number = easeInOutCubic,
): number => easing(segment(t, from, to))

export const easeLinear = (t: number): number => t
export const easeInQuad = (t: number): number => t * t
export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t)
export const easeInCubic = (t: number): number => t * t * t
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
export const easeOutBack = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
export const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3
  if (t <= 0) return 0
  if (t >= 1) return 1
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}
/** Smooth "settle" curve used for hand and object arrivals. */
export const easeOutSoft = (t: number): number => 1 - Math.pow(1 - t, 2.4)
/** Small overshoot that settles back — used for pops and bounces. */
export const easeOutBackSoft = (t: number): number => {
  const c1 = 1.2
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export const polar = (cx: number, cy: number, r: number, degrees: number): Pt => {
  const rad = (degrees * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export const rotatePt = (p: Pt, origin: Pt, degrees: number): Pt => {
  const rad = (degrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = p.x - origin.x
  const dy = p.y - origin.y
  return { x: origin.x + dx * cos - dy * sin, y: origin.y + dx * sin + dy * cos }
}

export const scalePt = (p: Pt, origin: Pt, s: number): Pt => ({
  x: origin.x + (p.x - origin.x) * s,
  y: origin.y + (p.y - origin.y) * s,
})

export const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y)

export const toFixed = (n: number, digits = 2): string => {
  const s = n.toFixed(digits)
  return s.replace(/\.?0+$/, '') || '0'
}

/** Build an SVG path string from a list of points. */
export function pathFromPoints(points: Pt[], closed = true, digits = 2): string {
  if (points.length === 0) return ''
  const head = `M${toFixed(points[0].x, digits)} ${toFixed(points[0].y, digits)}`
  const body = points
    .slice(1)
    .map((p) => `L${toFixed(p.x, digits)} ${toFixed(p.y, digits)}`)
    .join(' ')
  return `${head}${body.length ? ' ' + body : ''}${closed ? ' Z' : ''}`
}

/**
 * Catmull-Rom -> cubic Bézier conversion. Produces visibly smooth organic
 * outlines from a handful of control points, which is what the peel strips,
 * laces, water streams and leaves are built from.
 */
export function smoothPath(points: Pt[], closed = false, tension = 1, digits = 2): string {
  const n = points.length
  if (n === 0) return ''
  if (n === 1) return `M${toFixed(points[0].x, digits)} ${toFixed(points[0].y, digits)}`

  const at = (i: number): Pt => {
    if (closed) return points[(i + n) % n]
    return points[Math.max(0, Math.min(n - 1, i))]
  }

  const f = (v: number): string => toFixed(v, digits)
  let d = `M${f(points[0].x)} ${f(points[0].y)}`
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const t = tension / 6
    const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t }
    const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t }
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`
  }
  if (closed) d += ' Z'
  return d
}

/** Resample a polyline (or closed contour) to exactly `count` evenly spaced points. */
export function resample(points: Pt[], count: number, closed = false): Pt[] {
  if (points.length === 0) return []
  if (points.length === 1) return new Array(count).fill(points[0]) as Pt[]

  const src = closed ? [...points, points[0]] : points
  const lengths: number[] = [0]
  for (let i = 1; i < src.length; i++) {
    lengths.push(lengths[i - 1] + dist(src[i - 1], src[i]))
  }
  const total = lengths[lengths.length - 1]
  if (total === 0) return new Array(count).fill(points[0]) as Pt[]

  const out: Pt[] = []
  const steps = closed ? count : count - 1
  for (let i = 0; i < count; i++) {
    const target = (i / steps) * total
    let k = 1
    while (k < lengths.length - 1 && lengths[k] < target) k++
    const t = invLerp(lengths[k - 1], lengths[k], target)
    out.push(lerpPt(src[k - 1], src[k], clamp(t)))
  }
  return out
}

/**
 * Morph between two contours. Both shapes are resampled to the same number of
 * points, so any shape can smoothly become any other shape.
 */
export function morphContour(a: Pt[], b: Pt[], t: number, samples = 48): Pt[] {
  const from = resample(a, samples, true)
  const to = resample(b, samples, true)
  return from.map((p, i) => lerpPt(p, to[i], clamp(t)))
}

/** A capsule (stadium) outline between two points — fingers, laces, stems. */
export function capsule(a: Pt, b: Pt, radius: number, samples = 26): Pt[] {
  const angle = Math.atan2(b.y - a.y, b.x - a.x)
  const half: Pt[] = []
  const steps = Math.max(3, Math.round(samples / 2))
  for (let i = 0; i <= steps; i++) {
    const th = angle - Math.PI / 2 + (Math.PI * i) / steps
    half.push({ x: b.x + radius * Math.cos(th), y: b.y + radius * Math.sin(th) })
  }
  for (let i = 0; i <= steps; i++) {
    const th = angle + Math.PI / 2 + (Math.PI * i) / steps
    half.push({ x: a.x + radius * Math.cos(th), y: a.y + radius * Math.sin(th) })
  }
  return half
}

/** Rounded rectangle as a contour. */
export function roundRect(x: number, y: number, w: number, h: number, r: number, steps = 6): Pt[] {
  const radius = Math.min(r, w / 2, h / 2)
  const pts: Pt[] = []
  const corners: Array<[number, number, number]> = [
    [x + w - radius, y + radius, -90],
    [x + w - radius, y + h - radius, 0],
    [x + radius, y + h - radius, 90],
    [x + radius, y + radius, 180],
  ]
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= steps; i++) {
      pts.push(polar(cx, cy, radius, start + (90 * i) / steps))
    }
  }
  return pts
}

/** Ellipse as a contour. */
export function ellipse(cx: number, cy: number, rx: number, ry: number, steps = 40): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * Math.PI * 2
    pts.push({ x: cx + rx * Math.cos(th), y: cy + ry * Math.sin(th) })
  }
  return pts
}

/** Teardrop / droplet contour pointing "down" by default. */
export function droplet(cx: number, cy: number, w: number, h: number): Pt[] {
  return [
    { x: cx, y: cy - h },
    { x: cx + w * 0.62, y: cy - h * 0.1 },
    { x: cx + w * 0.72, y: cy + h * 0.42 },
    { x: cx, y: cy + h },
    { x: cx - w * 0.72, y: cy + h * 0.42 },
    { x: cx - w * 0.62, y: cy - h * 0.1 },
  ]
}

/** Point along a quadratic Bézier. */
export function quadPoint(p0: Pt, c: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t
  return {
    x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
  }
}

/** Sample a quadratic Bézier into a polyline. */
export function quadPoints(p0: Pt, c: Pt, p1: Pt, steps = 24): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i <= steps; i++) pts.push(quadPoint(p0, c, p1, i / steps))
  return pts
}

/** Sample a cubic Bézier into a polyline. */
export function cubicPoints(p0: Pt, c1: Pt, c2: Pt, p1: Pt, steps = 32): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    pts.push({
      x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
      y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
    })
  }
  return pts
}

/** Cubic Bézier point at t. */
export function cubicPoint(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
  }
}

/**
 * Offset a spine curve sideways, i.e. build a ribbon of varying width.
 * Used for peel strips, water streams and leaf blades.
 */
export function ribbon(
  spine: Pt[],
  halfWidth: (t: number) => number,
): { left: Pt[]; right: Pt[] } {
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i < spine.length; i++) {
    const prev = spine[Math.max(0, i - 1)]
    const next = spine[Math.min(spine.length - 1, i + 1)]
    const tx = next.x - prev.x
    const ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    const nx = -ty / len
    const ny = tx / len
    const w = halfWidth(i / (spine.length - 1))
    left.push({ x: spine[i].x + nx * w, y: spine[i].y + ny * w })
    right.push({ x: spine[i].x - nx * w, y: spine[i].y - ny * w })
  }
  return { left, right }
}

/** Closed contour from a ribbon (left edge forward, right edge back). */
export function ribbonContour(spine: Pt[], halfWidth: (t: number) => number): Pt[] {
  const { left, right } = ribbon(spine, halfWidth)
  return [...left, ...right.slice().reverse()]
}

/** Darken/lighten a hex colour by a ratio (-1..1). */
export function shade(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const num = parseInt(full, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const mix = (c: number) =>
    Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + Math.max(-1, amount)))
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** Linear interpolation between two hex colours. */
export function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '')
    const full =
      clean.length === 3
        ? clean
            .split('')
            .map((c) => c + c)
            .join('')
        : clean
    const num = parseInt(full, 16)
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const k = clamp(t)
  const to = (v: number): string => Math.round(v).toString(16).padStart(2, '0')
  return `#${to(r1 + (r2 - r1) * k)}${to(g1 + (g2 - g1) * k)}${to(b1 + (b2 - b1) * k)}`
}

/**
 * Smooth scalar profile defined by control keys [[x, y], ...] with x in 0..1.
 * Used for radius profiles: stem -> belly -> tip of organic shapes.
 */
export function profile(x: number, keys: Array<[number, number]>): number {
  const t = clamp(x)
  const n = keys.length
  if (t <= keys[0][0]) return keys[0][1]
  if (t >= keys[n - 1][0]) return keys[n - 1][1]

  let i = 0
  while (i < n - 2 && t > keys[i + 1][0]) i++
  const [x0, y0] = keys[Math.max(0, i - 1)]
  const [x1, y1] = keys[i]
  const [x2, y2] = keys[i + 1]
  const [x3, y3] = keys[Math.min(n - 1, i + 2)]
  const local = invLerp(x1, x2, t)

  // Catmull-Rom on the y values, with x-aware tangents.
  const dy = (ya: number, yb: number, span: number): number =>
    span === 0 ? 0 : ((yb - ya) / span) * (x2 - x1) * 0.5
  const m1 = dy(y0, y2, Math.max(1e-6, x2 - x0))
  const m2 = dy(y1, y3, Math.max(1e-6, x3 - x1))
  const l2 = local * local
  const l3 = l2 * local
  return (
    (2 * l3 - 3 * l2 + 1) * y1 +
    (l3 - 2 * l2 + local) * m1 +
    (-2 * l3 + 3 * l2) * y2 +
    (l3 - l2) * m2
  )
}
