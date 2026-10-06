import { memo, type ReactNode } from 'react'
import { type Pt, pathFromPoints, smoothPath } from './geometry'

export interface InkProps {
  /** Outline points (contour) or spine points (open shape). */
  points: Pt[]
  closed?: boolean
  /** Use smooth Catmull-Rom curves instead of straight segments. */
  smooth?: boolean
  tension?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeLinecap?: 'butt' | 'round' | 'square'
  strokeLinejoin?: 'miter' | 'round' | 'bevel'
  opacity?: number
  filter?: string
  clipPath?: string
  className?: string
}

/**
 * The single drawing primitive every scene is built from: a set of points
 * rendered as a smooth or faceted path. Because points are recomputed from the
 * timeline on every frame, shapes can morph, bend and unfold freely.
 */
export const Ink = memo(function Ink({
  points,
  closed = true,
  smooth = false,
  tension = 1,
  fill = 'none',
  stroke = 'none',
  strokeWidth = 0,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  opacity,
  filter,
  clipPath,
  className,
}: InkProps) {
  if (points.length < 2) return null
  const d = smooth
    ? smoothPath(points, closed, tension, 2)
    : pathFromPoints(points, closed, 2)
  return (
    <path
      className={className}
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth || undefined}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      opacity={opacity}
      filter={filter}
      clipPath={clipPath}
    />
  )
})

/** A simple filled ellipse — shadows, highlights, droplets, joints. */
export function Blob({
  cx,
  cy,
  rx,
  ry,
  fill,
  opacity,
  rotate = 0,
  stroke,
  strokeWidth,
  filter,
  className,
}: {
  cx: number
  cy: number
  rx: number
  ry: number
  fill: string
  opacity?: number
  rotate?: number
  stroke?: string
  strokeWidth?: number
  filter?: string
  className?: string
}) {
  return (
    <ellipse
      className={className}
      cx={cx}
      cy={cy}
      rx={Math.max(0.1, rx)}
      ry={Math.max(0.1, ry)}
      fill={fill}
      opacity={opacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      filter={filter}
      transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}
    />
  )
}

/** Soft contact shadow that sits under an object on the "table". */
export function ContactShadow({
  cx,
  cy,
  rx,
  opacity = 0.22,
  filterId,
}: {
  cx: number
  cy: number
  rx: number
  opacity?: number
  filterId: string
}) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.26} fill="#4A3B30" opacity={opacity} filter={`url(#${filterId})`} />
}

/** Rounded-rectangle "panel" used for objects like tiles, cards, benches. */
export function Panel({
  x,
  y,
  w,
  h,
  r = 8,
  fill,
  stroke,
  strokeWidth = 2.4,
  opacity,
  rotate,
  cx,
  cy,
}: {
  x: number
  y: number
  w: number
  h: number
  r?: number
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  rotate?: number
  cx?: number
  cy?: number
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      transform={rotate ? `rotate(${rotate} ${cx ?? x + w / 2} ${cy ?? y + h / 2})` : undefined}
    />
  )
}

/** Small sparkle used for feedback moments. */
export function Sparkle({
  x,
  y,
  size,
  opacity = 1,
  color = '#FFFFFF',
  rotate = 0,
}: {
  x: number
  y: number
  size: number
  opacity?: number
  color?: string
  rotate?: number
}) {
  const s = size
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path
        d={`M0 ${-s} C ${s * 0.12} ${-s * 0.28} ${s * 0.28} ${-s * 0.12} ${s} 0 C ${s * 0.28} ${
          s * 0.12
        } ${s * 0.12} ${s * 0.28} 0 ${s} C ${-s * 0.12} ${s * 0.28} ${-s * 0.28} ${s * 0.12} ${-s} 0 C ${
          -s * 0.28
        } ${-s * 0.12} ${-s * 0.12} ${-s * 0.28} 0 ${-s} Z`}
        fill={color}
      />
    </g>
  )
}

/** Motion trail dots — used to emphasise speed without text. */
export function MotionTrail({
  points,
  radius,
  color = '#4A3B30',
  opacity = 0.25,
}: {
  points: Pt[]
  radius: number
  color?: string
  opacity?: number
}) {
  return (
    <g>
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={radius * (1 - (i / points.length) * 0.6)}
          fill={color}
          opacity={opacity * (1 - i / points.length) * 0.9}
        />
      ))}
    </g>
  )
}

/**
 * Scene wrapper: fixed 4:3 viewBox, warm backdrop, floor line and the shared
 * SVG <defs>. Every lesson scene renders inside one of these, which is what
 * keeps the whole library visually coherent.
 */
export function SceneBackdrop({
  children,
  hue = '#FFD24D',
  floorY = 440,
  showFloor = true,
}: {
  children: ReactNode
  hue?: string
  floorY?: number
  showFloor?: boolean
}) {
  return (
    <g>
      <rect x={0} y={0} width={720} height={560} fill="#FFF8E8" />
      <path
        d={`M0 0 H720 V${floorY} C 560 ${floorY - 34} 420 ${floorY + 26} 250 ${floorY - 8} C 140 ${
          floorY - 26
        } 60 ${floorY - 6} 0 ${floorY - 22} Z`}
        fill="#FFF1D6"
        opacity={0.85}
      />
      <circle cx={118} cy={112} r={78} fill={hue} opacity={0.16} />
      <circle cx={604} cy={86} r={54} fill="#0E7490" opacity={0.07} />
      {showFloor && (
        <>
          <rect x={0} y={floorY} width={720} height={560 - floorY} fill="#F6E3C4" />
          <path
            d={`M0 ${floorY} H720`}
            stroke="#E2C8A5"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.9}
          />
        </>
      )}
      {children}
    </g>
  )
}
