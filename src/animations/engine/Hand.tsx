import { memo } from 'react'
import { capsule, clamp, lerp, lerpPt, type Pt, smoothPath } from './geometry'
import { palette } from './theme'

/**
 * A friendly, chunky vector hand.
 *
 * The hand is authored in its own local space:
 *   - the palm is centred on (0, 0)
 *   - fingers point towards -y, the wrist sits at +y
 *   - the forearm extends away from the wrist along `armAngle` (90 = downwards)
 *
 * Scenes place it with `center` / `rotate` / `scale`, which keeps the geometry
 * reusable for holding, pointing, gripping and reaching poses.
 */

export interface HandProps {
  /** Where the palm centre sits in scene coordinates. */
  center: Pt
  /** Rotation of the whole hand in degrees. */
  rotate?: number
  /** Uniform scale. */
  scale?: number
  /** Local-space direction (degrees) the forearm runs from the wrist. 90 = down. */
  armAngle?: number
  /** How far the forearm extends, in local units. */
  armLength?: number
  /** Curl per finger: [index, middle, ring, pinky], 0 open .. 1 fully closed. */
  fingers?: [number, number, number, number]
  /** Curl of the thumb, 0 relaxed .. 1 pressing. */
  thumb?: number
  /** Which way the fingers curl. 1 = towards +x, -1 = towards -x. */
  curlDirection?: 1 | -1
  /** Small depth fake: 0.85 reads as further away, 1.1 as closer. */
  perspective?: number
  /** Show the forearm + sleeve. */
  showArm?: boolean
  sleeveColor?: string
  skinColor?: string
  opacity?: number
  /** Draw order helper — scene text may sit above or below the hand. */
  className?: string
}

interface Joint {
  root: Pt
  mid: Pt
  tip: Pt
}

const FINGER_LENGTHS = [42, 44, 40, 32]
const FINGER_X = [-14.5, -5, 4.5, 13.5]

function fingerJoints(
  root: Pt,
  length: number,
  curl: number,
  dir: 1 | -1,
  spread: number,
): Joint {
  const c = clamp(curl)
  const base = -90 + spread
  const bend1 = c * 62 * dir
  const bend2 = c * 74 * dir
  const midAngle = base + bend1 * 0.5
  const tipAngle = midAngle + bend1 * 0.5 + bend2
  const mid = {
    x: root.x + Math.cos((midAngle * Math.PI) / 180) * length * 0.56,
    y: root.y + Math.sin((midAngle * Math.PI) / 180) * length * 0.56,
  }
  const tip = {
    x: mid.x + Math.cos((tipAngle * Math.PI) / 180) * length * 0.46,
    y: mid.y + Math.sin((tipAngle * Math.PI) / 180) * length * 0.46,
  }
  return { root, mid, tip }
}

/** Outline of a tapered two-segment finger as a single smooth closed path. */
function fingerPath(joints: Joint, r1: number, r2: number): string {
  const edge = (a: Pt, b: Pt, ra: number, rb: number, side: 1 | -1): Pt[] => {
    const pts: Pt[] = []
    for (let i = 0; i <= 6; i++) {
      const t = i / 6
      const p = lerpPt(a, b, t)
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      const n = ((ang + 90 * side) * Math.PI) / 180
      const r = lerp(ra, rb, t)
      pts.push({ x: p.x + Math.cos(n) * r, y: p.y + Math.sin(n) * r })
    }
    return pts
  }
  const left = [
    ...edge(joints.root, joints.mid, r1, r1 * 0.94, 1),
    ...edge(joints.mid, joints.tip, r1 * 0.94, r2, 1).slice(1),
  ]
  const right = [
    ...edge(joints.root, joints.mid, r1, r1 * 0.94, -1),
    ...edge(joints.mid, joints.tip, r1 * 0.94, r2, -1).slice(1),
  ]
  return smoothPath([...left, ...right.reverse()], true, 0.7)
}

export const Hand = memo(function Hand({
  center,
  rotate = 0,
  scale = 1,
  armAngle = 90,
  armLength = 170,
  fingers = [0.35, 0.4, 0.45, 0.55],
  thumb = 0.35,
  curlDirection = 1,
  perspective = 1,
  showArm = true,
  sleeveColor = palette.sleeve,
  skinColor = palette.skin,
  opacity = 1,
  className,
}: HandProps) {
  const p = perspective
  const strokeW = 2.6 * p

  // ---- palm -----------------------------------------------------------------
  const palmTop = -25 * p
  const palmBottom = 27 * p
  const halfWidth = 24 * p
  const palmPts: Pt[] = [
    { x: -halfWidth * 0.92, y: palmTop + 2 },
    { x: halfWidth * 0.98, y: palmTop },
    { x: halfWidth, y: palmBottom * 0.35 },
    { x: halfWidth * 0.72, y: palmBottom },
    { x: -halfWidth * 0.78, y: palmBottom },
    { x: -halfWidth, y: palmBottom * 0.2 },
  ]
  const palmPath = smoothPath(palmPts, true, 0.9)

  // ---- fingers --------------------------------------------------------------
  const spreads = [-11, -3.5, 4, 12]
  const fingerPaths = FINGER_LENGTHS.map((len, i) => {
    const root = { x: FINGER_X[i] * p, y: palmTop + 1 }
    const j = fingerJoints(root, len * p, fingers[i], curlDirection, spreads[i])
    return fingerPath(j, 8.4 * p, 6.9 * p)
  })

  // ---- thumb ----------------------------------------------------------------
  const thumbRoot = { x: -halfWidth * 0.86, y: palmBottom * 0.1 }
  const thumbLen = 40 * p
  const thumbSpread = -150 + thumb * 26 * curlDirection
  const thumbJoints: Joint = (() => {
    const base = thumbSpread
    const midAngle = base + thumb * 26 * curlDirection
    const tipAngle = midAngle + thumb * 30 * curlDirection
    const mid = {
      x: thumbRoot.x + Math.cos((midAngle * Math.PI) / 180) * thumbLen * 0.52,
      y: thumbRoot.y + Math.sin((midAngle * Math.PI) / 180) * thumbLen * 0.52,
    }
    const tip = {
      x: mid.x + Math.cos((tipAngle * Math.PI) / 180) * thumbLen * 0.5,
      y: mid.y + Math.sin((tipAngle * Math.PI) / 180) * thumbLen * 0.5,
    }
    return { root: thumbRoot, mid, tip }
  })()

  // ---- forearm + sleeve -----------------------------------------------------
  const wrist: Pt = { x: 0, y: palmBottom - 2 }
  const rad = (armAngle * Math.PI) / 180
  const armEnd: Pt = {
    x: wrist.x + Math.cos(rad) * armLength * p,
    y: wrist.y + Math.sin(rad) * armLength * p,
  }
  const cuffEnd: Pt = {
    x: wrist.x + Math.cos(rad) * Math.min(66, armLength) * p,
    y: wrist.y + Math.sin(rad) * Math.min(66, armLength) * p,
  }
  const armPath = smoothPath(capsule(wrist, armEnd, halfWidth * 0.72, 18), true, 0.85)
  const sleevePath = smoothPath(capsule(cuffEnd, armEnd, halfWidth * 0.76, 18), true, 0.85)
  const cuffPath = smoothPath(capsule(wrist, cuffEnd, halfWidth * 0.78, 16), true, 0.85)

  return (
    <g
      className={className}
      opacity={opacity}
      transform={`translate(${center.x} ${center.y}) rotate(${rotate}) scale(${scale})`}
    >
      {showArm && (
        <>
          <path d={armPath} fill={skinColor} stroke={palette.skinLine} strokeWidth={strokeW} strokeLinejoin="round" />
          <path d={sleevePath} fill={sleeveColor} stroke={palette.skinLine} strokeWidth={strokeW} strokeLinejoin="round" />
          <path d={cuffPath} fill={sleeveColor} stroke={palette.skinLine} strokeWidth={strokeW} strokeLinejoin="round" />
          {/* cuff seam */}
          <path
            d={`M${cuffEnd.x - 14} ${cuffEnd.y} L${cuffEnd.x + 14} ${cuffEnd.y}`}
            stroke={palette.skinLine}
            strokeWidth={strokeW * 0.6}
            strokeLinecap="round"
            opacity={0.5}
            transform={`rotate(${armAngle} ${cuffEnd.x} ${cuffEnd.y})`}
          />
        </>
      )}

      {/* palm */}
      <path d={palmPath} fill={skinColor} stroke={palette.skinLine} strokeWidth={strokeW} strokeLinejoin="round" />
      <path d={fingerPath(thumbJoints, 9.4 * p, 7.6 * p)} fill={skinColor} stroke={palette.skinLine} strokeWidth={strokeW} strokeLinejoin="round" />
      {fingerPaths.map((d, i) => (
        <path key={i} d={d} fill={skinColor} stroke={palette.skinLine} strokeWidth={strokeW} strokeLinejoin="round" />
      ))}

      {/* palm crease + knuckle hint, only when the hand is large enough to read */}
      {p > 0.78 && (
        <>
          <path
            d={`M${-halfWidth * 0.5} ${palmTop * 0.35} q ${halfWidth * 0.55} ${palmBottom * 0.32} ${halfWidth * 0.86} ${-2}`}
            fill="none"
            stroke={palette.skinShade}
            strokeWidth={2.1}
            strokeLinecap="round"
            opacity={0.55}
          />
          <ellipse
            cx={-halfWidth * 0.06}
            cy={palmBottom * 0.42}
            rx={halfWidth * 0.42}
            ry={palmBottom * 0.2}
            fill={palette.skinShade}
            opacity={0.22}
          />
        </>
      )}
    </g>
  )
})
