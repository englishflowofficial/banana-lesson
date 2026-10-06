import { memo } from 'react'
import {
  clamp,
  easeInOutCubic,
  easeOutBackSoft,
  easeOutCubic,
  easeOutSoft,
  lerp,
  lerpPt,
  mixHex,
  type Pt,
  profile,
  quadPoint,
  rotatePt,
  seg,
  shade,
  smoothPath,
} from '../engine/geometry'
import { palette } from '../engine/theme'
import { Hand } from '../engine/Hand'
import { GRIP, PRESS } from '../engine/handPoses'
import { Blob, SceneBackdrop, Sparkle } from '../engine/primitives'
import type { SceneProps } from './types'

/* -------------------------------------------------------------------------- */
/*  Banana geometry                                                            */
/* -------------------------------------------------------------------------- */

const RAD = Math.PI / 180

/** Spine of the fruit: quadratic Bézier from the stem end down to the base. */
const SPINE = {
  p0: { x: 350, y: 132 },
  c: { x: 292, y: 258 },
  p1: { x: 380, y: 400 },
}

const PEEL_RADIUS: Array<[number, number]> = [
  [0.0, 5],
  [0.05, 12],
  [0.18, 24],
  [0.42, 31],
  [0.66, 30],
  [0.86, 23],
  [1.0, 8],
]

const spineAt = (s: number): Pt => quadPoint(SPINE.p0, SPINE.c, SPINE.p1, clamp(s))
const radiusAt = (s: number): number => Math.max(3.5, profile(s, PEEL_RADIUS))
const fruitRadiusAt = (s: number): number => Math.max(3.5, radiusAt(s) * 0.84)

function tangentAt(s: number): Pt {
  const u = clamp(s)
  const tx = 2 * (1 - u) * (SPINE.c.x - SPINE.p0.x) + 2 * u * (SPINE.p1.x - SPINE.c.x)
  const ty = 2 * (1 - u) * (SPINE.c.y - SPINE.p0.y) + 2 * u * (SPINE.p1.y - SPINE.c.y)
  const len = Math.hypot(tx, ty) || 1
  return { x: tx / len, y: ty / len }
}

/** Screen-space normal: points to the right-hand side of the banana. */
function normalAt(s: number): Pt {
  const t = tangentAt(s)
  return { x: t.y, y: -t.x }
}

/** Offset a spine polyline sideways to produce a closed band contour. */
function bandFromSpine(spine: Pt[], widths: number[]): Pt[] {
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i < spine.length; i++) {
    const prev = spine[Math.max(0, i - 1)]
    const next = spine[Math.min(spine.length - 1, i + 1)]
    const ang = Math.atan2(next.y - prev.y, next.x - prev.x) - Math.PI / 2
    const w = widths[i]
    left.push({ x: spine[i].x + Math.cos(ang) * w, y: spine[i].y + Math.sin(ang) * w })
    right.push({ x: spine[i].x - Math.cos(ang) * w, y: spine[i].y - Math.sin(ang) * w })
  }
  return [...left, ...right.reverse()]
}

/** Offset + width band helper, for highlights and edge shading. */
function offsetBand(spine: Pt[], widths: number[], offsetFactor: number, widthFactor: number): Pt[] {
  return bandFromSpine(
    spine.map((p, i) => {
      const prev = spine[Math.max(0, i - 1)]
      const next = spine[Math.min(spine.length - 1, i + 1)]
      const ang = Math.atan2(next.y - prev.y, next.x - prev.x) - Math.PI / 2
      const off = widths[i] * offsetFactor
      return { x: p.x + Math.cos(ang) * off, y: p.y + Math.sin(ang) * off }
    }),
    widths.map((w) => Math.max(0.6, w * widthFactor)),
  )
}

/** The base of the banana: every peel section hinges here. */
const HINGE = spineAt(0.965)

/* -------------------------------------------------------------------------- */
/*  Peel sections                                                              */
/* -------------------------------------------------------------------------- */

const STRIP_S_FROM = 0.03
const STRIP_S_TO = 0.995
const STRIP_SAMPLES = 13
const PEEL_INNER = '#F7DF97'

/**
 * Where a section hangs once it is fully peeled. Instead of rotating the
 * section like a rigid flap (which collapses into thin spikes), each section is
 * authored in two poses — flat against the fruit, and hanging free — and the two
 * contours are interpolated. That keeps every strip wide, curved and readable.
 */
interface PeelPose {
  /** Direction the strip points once open, in degrees (90 = straight down). */
  dir: number
  /** Length of the hanging strip. */
  length: number
  /** Sideways curl, positive curls clockwise. */
  curl: number
}

interface StripSpec {
  /** Angular span around the trunk in degrees. 0 = facing the viewer. */
  a: number
  b: number
  pose: PeelPose
  /** Timeline window in which this section opens. */
  from: number
  to: number
}

const STRIPS: StripSpec[] = [
  { a: -70, b: -23.3, pose: { dir: 142, length: 118, curl: -30 }, from: 0.48, to: 0.7 },
  { a: -23.3, b: 23.3, pose: { dir: 92, length: 136, curl: 6 }, from: 0.41, to: 0.64 },
  { a: 23.3, b: 70, pose: { dir: 42, length: 118, curl: 30 }, from: 0.45, to: 0.68 },
]

/** Width of a strip, front-on, once it has unrolled off the fruit. */
const stripWidthProfile: Array<[number, number]> = [
  [0, 0.86],
  [0.28, 1],
  [0.62, 0.82],
  [0.85, 0.52],
  [1, 0.06],
]

function stripContour(spec: StripSpec, fold: number): Pt[] {
  const sinLow = Math.sin(spec.a * RAD)
  const sinHigh = Math.sin(spec.b * RAD)
  const centre = (sinLow + sinHigh) / 2
  const halfSpan = (sinHigh - sinLow) / 2

  // Width of the widest part of this section while it is still on the fruit.
  const maxHalfWidth = radiusAt(0.42) * halfSpan

  const dirRad = spec.pose.dir * RAD
  const dir: Pt = { x: Math.cos(dirRad), y: Math.sin(dirRad) }
  const perp: Pt = { x: -dir.y, y: dir.x }

  const spine: Pt[] = []
  const widths: number[] = []

  for (let i = 0; i <= STRIP_SAMPLES; i++) {
    const u = i / STRIP_SAMPLES
    const s = lerp(STRIP_S_TO, STRIP_S_FROM, u)

    const base = spineAt(s)
    const n = normalAt(s)
    const r = radiusAt(s)
    const closed: Pt = { x: base.x + n.x * r * centre, y: base.y + n.y * r * centre }
    const closedHalf = r * halfSpan * 0.95

    const bend = spec.pose.curl * u * u
    const open: Pt = {
      x: HINGE.x + dir.x * spec.pose.length * u + perp.x * bend,
      y: HINGE.y + dir.y * spec.pose.length * u + perp.y * bend,
    }
    const openHalf = maxHalfWidth * profile(u, stripWidthProfile)

    // The free end leads the movement, so the peel unfurls instead of flipping.
    const blend = Math.pow(fold, 0.62 + 0.5 * u)

    spine.push(lerpPt(closed, open, blend))
    widths.push(Math.max(1.6, lerp(closedHalf, openHalf, blend)))
  }

  return bandFromSpine(spine, widths)
}

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                   */
/* -------------------------------------------------------------------------- */

const T = {
  appear: [0.0, 0.07],
  handAHold: [0.02, 0.13],
  handBGrab: [0.11, 0.23],
  bend: [0.25, 0.4],
  crack: [0.35, 0.45],
  shine: [0.7, 0.88],
  lift: [0.78, 0.94],
  handBExit: [0.62, 0.78],
} as const

const STEM_BEND_MAX = 0.5

const VIEW_SCALE = 1.22
const VIEW_PIVOT: Pt = { x: 352, y: 300 }
/** Scales the whole composition (banana + hands) about a fixed pivot. */
const view = { x: VIEW_PIVOT.x, y: VIEW_PIVOT.y, s: VIEW_SCALE }

export const BananaPeelScene = memo(function BananaPeelScene({ t, uid }: SceneProps) {
  /* ---- overall life ------------------------------------------------------- */
  const appear = easeOutBackSoft(seg(t, T.appear[0], T.appear[1]))
  const lift = easeOutSoft(seg(t, T.lift[0], T.lift[1]))
  const bobY = -lift * 12
  const sway = Math.sin(t * Math.PI * 4) * 0.8 + lift * 2

  /* ---- holding hand ------------------------------------------------------- */
  const handAIn = easeOutSoft(seg(t, T.handAHold[0], T.handAHold[1]))
  const grip = clamp(seg(t, T.handAHold[0] + 0.03, T.handAHold[1] + 0.02))
  const handAFingers: [number, number, number, number] = [
    lerp(0.12, GRIP[0], grip),
    lerp(0.18, GRIP[1], grip),
    lerp(0.24, GRIP[2], grip),
    lerp(0.32, GRIP[3], grip),
  ]

  /* ---- pulling hand ------------------------------------------------------- */
  const handBIn = easeOutSoft(seg(t, T.handBGrab[0], T.handBGrab[1]))
  const pinch = clamp(seg(t, T.handBGrab[0] + 0.07, T.handBGrab[1] + 0.02))
  const exit = easeOutCubic(seg(t, T.handBExit[0], T.handBExit[1]))

  /* ---- stem --------------------------------------------------------------- */
  const bendRaw = seg(t, T.bend[0], T.bend[1], easeOutCubic)
  const wobble = Math.sin(bendRaw * Math.PI * 3) * (1 - bendRaw) * 0.05
  const stemBend = clamp(bendRaw + wobble) * STEM_BEND_MAX

  const stemBase = spineAt(0.0)
  const stemDir = (() => {
    const tan = tangentAt(0)
    return { x: -tan.x, y: -tan.y }
  })()
  const stemLen = 46
  /** Bend grows towards the tip, so the stem stays rooted in the fruit. */
  const stemPointAt = (bend: number, u: number): Pt => {
    const straight: Pt = {
      x: stemBase.x + stemDir.x * stemLen * u,
      y: stemBase.y + stemDir.y * stemLen * u,
    }
    const rooted = rotatePt(straight, stemBase, (bend * Math.pow(u, 1.5) * 180) / Math.PI)
    rooted.x += Math.sin(u * 2.2) * 3.4 * (1 - u)
    return rooted
  }
  const gripPoint: Pt = stemPointAt(stemBend, 0.62)
  const handBRotate = -42 + exit * 16
  const localPinch = rotatePt({ x: 5, y: -14 }, { x: 0, y: 0 }, handBRotate)
  const handBCenter: Pt = {
    x: gripPoint.x - localPinch.x + (1 - handBIn) * 130 + exit * 130,
    y: gripPoint.y - localPinch.y - (1 - handBIn) * 110 - exit * 150,
  }

  /* ---- peel --------------------------------------------------------------- */
  const crack = seg(t, T.crack[0], T.crack[1], easeOutCubic)
  const shine = seg(t, T.shine[0], T.shine[1])
  const strips = STRIPS.map((spec) => ({
    spec,
    fold: easeInOutCubic(seg(t, spec.from, spec.to)),
  }))
  const anyFold = strips.reduce((m, s) => Math.max(m, s.fold), 0)
  const peelShadow = clamp(seg(t, 0.45, 0.62))

  /* ---- fruit -------------------------------------------------------------- */
  const fruitSpine: Pt[] = []
  const fruitWidths: number[] = []
  for (let i = 0; i <= 24; i++) {
    const s = lerp(0.0, 1, i / 24)
    fruitSpine.push(spineAt(s))
    fruitWidths.push(fruitRadiusAt(s))
  }
  const fruitContour = bandFromSpine(fruitSpine, fruitWidths)
  const fruitPath = smoothPath(fruitContour, true, 0.85)
  /* ---- stem shape --------------------------------------------------------- */
  const stemPts: Pt[] = []
  for (let i = 0; i <= 8; i++) {
    stemPts.push(stemPointAt(stemBend, i / 8))
  }
  const stemWidths = stemPts.map((_, i) => lerp(7.4, 5, i / 8))
  const stemPath = smoothPath(bandFromSpine(stemPts, stemWidths), true, 0.8)

  /* ---- peel highlight (only while closed) --------------------------------- */
  const closedHighlight = smoothPath(
    bandFromSpine(
      fruitSpine.map((p, i) => {
        const s = lerp(0.0, 1, i / 24)
        const n = normalAt(s)
        return { x: p.x - n.x * radiusAt(s) * 0.5, y: p.y - n.y * radiusAt(s) * 0.5 }
      }),
      fruitWidths.map((w) => w * 0.2),
    ),
    true,
    0.85,
  )

  return (
    <SceneBackdrop hue="#FFD24D" floorY={466}>
      <defs>
        <clipPath id={`${uid}-fruit`}>
          <path d={fruitPath} />
        </clipPath>
        <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient id={`${uid}-peel`} gradientUnits="userSpaceOnUse" x1={276} y1={200} x2={352} y2={200}>
          <stop offset="0%" stopColor="#FFE9A6" />
          <stop offset="34%" stopColor="#F8CF3C" />
          <stop offset="72%" stopColor="#EFBB12" />
          <stop offset="100%" stopColor="#D9A400" />
        </linearGradient>
      </defs>

      <g transform={`translate(${view.x} ${view.y}) scale(${view.s}) translate(${-view.x} ${-view.y})`}>
      {/* ambient shadow behind the action */}
      <ellipse
        cx={352}
        cy={430 + bobY * 0.5}
        rx={150}
        ry={24}
        fill={palette.warmShadowStrong}
        filter={`url(#${uid}-soft)`}
        opacity={0.34 * appear}
      />

      <g transform={`translate(0 ${bobY}) rotate(${sway} 340 320)`} opacity={appear}>
        {/* -------------------------------- fruit -------------------------------- */}
        <path d={fruitPath} fill="#FCF2D4" stroke="#DFC079" strokeWidth={2.2} strokeLinejoin="round" />
        <g clipPath={`url(#${uid}-fruit)`}>
          {/* warm gold edges where the peel has just come away */}
          <path d={smoothPath(offsetBand(fruitSpine, fruitWidths, 0.66, 0.26), true, 0.85)} fill="#E9CF90" opacity={0.5 * peelShadow + 0.4} />
          <path d={smoothPath(offsetBand(fruitSpine, fruitWidths, -0.68, 0.24), true, 0.85)} fill="#F2E0AE" opacity={0.55} />
          {/* bright belly of the fruit */}
          <path d={smoothPath(offsetBand(fruitSpine, fruitWidths, -0.3, 0.3), true, 0.85)} fill="#FFFEF8" opacity={0.9} />
          <path d={smoothPath(offsetBand(fruitSpine, fruitWidths, 0.34, 0.22), true, 0.85)} fill="#F3E3B4" opacity={0.75} />
          {/* banana fibres */}
          <path
            d={smoothPath(offsetBand(fruitSpine, fruitWidths, 0.52, 0.045), true, 0.85)}
            fill="#E4CE96"
            opacity={0.75}
          />
          <path
            d={smoothPath(offsetBand(fruitSpine, fruitWidths, -0.52, 0.03), true, 0.85)}
            fill="#E4CE96"
            opacity={0.5}
          />
          {shine > 0.01 && (
            <g transform={`translate(${lerp(-150, 260, shine)} 0) rotate(14 320 260)`}>
              <rect x={300} y={40} width={46} height={420} fill="#FFFFFF" opacity={0.55} />
            </g>
          )}
        </g>

        {/* -------------------------------- peel --------------------------------- */}
        {strips.map(({ spec, fold }) => {
          const face = mixHex(palette.banana, PEEL_INNER, fold * 0.85)
          const edge = mixHex(shade(palette.banana, -0.36), shade(PEEL_INNER, -0.26), fold * 0.85)
          const d = smoothPath(stripContour(spec, fold), true, 0.7)
          return (
            <g key={`${spec.a}-${spec.b}`}>
              <path d={d} fill={face} stroke={edge} strokeWidth={2.1} strokeLinejoin="round" />
              {/* cylindrical shading, cross-fading out as the section opens */}
              <path d={d} fill={`url(#${uid}-peel)`} opacity={clamp(1 - fold * 1.25)} />
            </g>
          )
        })}

        {/* the light stripe along unpeeled peel */}
        <path d={closedHighlight} fill={palette.bananaLight} opacity={0.5 * clamp(1 - anyFold * 2.2)} />

        {/* -------------------------------- stem --------------------------------- */}
        <path
          d={stemPath}
          fill={palette.bananaDark}
          stroke={shade(palette.bananaDark, -0.2)}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d={smoothPath(bandFromSpine(stemPts.slice(0, 6), stemWidths.slice(0, 6).map((w) => w * 0.34)), true, 0.8)}
          fill={shade(palette.bananaDark, 0.32)}
          opacity={0.9}
        />

        {/* the split that opens where the stem bends back */}
        {crack > 0.01 && (
          <g>
            <ellipse
              cx={spineAt(0.07).x - 2}
              cy={spineAt(0.07).y}
              rx={17 * crack}
              ry={9 * crack}
              fill="#FFF7DA"
              opacity={0.5 * crack}
              filter={`url(#${uid}-glow)`}
            />
            <path
              d={smoothPath(
                [
                  spineAt(0.02),
                  { x: spineAt(0.12).x - 4 * crack, y: spineAt(0.12).y },
                  { x: spineAt(0.22).x + 3 * crack, y: spineAt(0.22).y },
                ],
                false,
                0.7,
              )}
              fill="none"
              stroke="#FFF8DE"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.95 * crack}
            />
            {[0, 1, 2].map((i) => (
              <Sparkle
                key={i}
                x={spineAt(0.06 + i * 0.06).x + (i % 2 === 0 ? -1 : 1) * (20 + i * 8) * crack}
                y={spineAt(0.06 + i * 0.06).y - (14 + i * 8) * crack}
                size={5 - i * 0.7}
                opacity={clamp(crack * 1.8 - 0.6)}
                color="#FFFFFF"
              />
            ))}
          </g>
        )}

        {/* ------------------------------ holder hand ---------------------------- */}
        <Hand
          center={{ x: 402, y: 306 }}
          rotate={-94 + sway * 0.6}
          armAngle={132}
          armLength={195}
          fingers={handAFingers}
          thumb={lerp(0.18, 0.74, grip)}
          curlDirection={-1}
          perspective={1.14}
          sleeveColor={palette.sleeve}
          opacity={handAIn}
        />

        {/* ------------------------------ pulling hand --------------------------- */}
        <Hand
          center={handBCenter}
          rotate={handBRotate}
          armAngle={-20}
          armLength={300}
          fingers={[
            lerp(0.08, 0.72, pinch),
            lerp(0.12, 0.78, pinch),
            lerp(0.18, 0.8, pinch),
            lerp(0.28, 0.7, pinch),
          ]}
          thumb={lerp(0.12, PRESS[1] + 0.2, pinch)}
          curlDirection={-1}
          perspective={1.0}
          sleeveColor={palette.sleeveShade}
          opacity={handBIn * (1 - exit * 0.92)}
        />
      </g>

        {/* ------------------------------ flourish -------------------------------- */}
        {lift > 0.15 && (
          <g opacity={clamp((lift - 0.15) * 2.2) * clamp(1 - seg(t, 0.97, 1))}>
            <Sparkle x={196} y={112} size={11} color="#FFFFFF" />
            <Sparkle x={520} y={168} size={8} color="#FFE79A" rotate={-18} />
            <Blob cx={240} cy={74} rx={4} ry={4} fill="#FFFFFF" opacity={0.9} />
          </g>
        )}
      </g>
    </SceneBackdrop>
  )
})
