import { memo } from 'react'
import {
  pathFromPoints,
  clamp,
  easeInOutCubic,
  easeOutCubic,
  easeOutSoft,
  lerp,
  quadPoint,
  quadPoints,
  ribbonContour,
  seg,
  smoothPath,
  type Pt,
} from '../engine/geometry'
import { palette } from '../engine/theme'
import { Hand } from '../engine/Hand'
import { GRIP } from '../engine/handPoses'
import { Blob, Ink, SceneBackdrop, Sparkle } from '../engine/primitives'
import type { SceneProps } from './types'

/**
 * "Pouring water" — a jug tilts, a stream falls into a glass and the water
 * level rises. Everything is generated from the timeline.
 */

const FLOOR = 448
const GLASS = { cx: 452, top: 214, bottom: 424, topWidth: 84, bottomWidth: 70 }
const JUG = { x: 236, y: 214 }
const SPOUT_LOCAL: Pt = { x: 104, y: -44 }

const spoutWorld = (tiltDeg: number): Pt => {
  const rad = (tiltDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    x: JUG.x + SPOUT_LOCAL.x * cos - SPOUT_LOCAL.y * sin,
    y: JUG.y + SPOUT_LOCAL.x * sin + SPOUT_LOCAL.y * cos,
  }
}

export const PourWaterScene = memo(function PourWaterScene({ t, uid }: SceneProps) {
  const tilt = lerp(0, -36, easeInOutCubic(seg(t, 0.08, 0.3))) * (1 - easeInOutCubic(seg(t, 0.84, 1)))
  const pouring = clamp(seg(t, 0.24, 0.33) - seg(t, 0.84, 0.94))

  const levelTarget = easeOutCubic(seg(t, 0.28, 0.9))
  const level = lerp(46, 148, levelTarget)
  const waterTop = GLASS.bottom - level

  const spout = spoutWorld(tilt)
  const handIn = easeOutSoft(seg(t, 0.0, 0.1))
  const idle = Math.sin(t * Math.PI * 4) * 2.2

  // Stream: a quad curve from the spout to the water surface, with a gentle wag.
  const wag = Math.sin(t * Math.PI * 8) * 4
  const streamEnd: Pt = { x: GLASS.cx + wag * 0.4, y: waterTop + 4 }
  const control: Pt = {
    x: (spout.x + streamEnd.x) / 2 + 6,
    y: (spout.y + streamEnd.y) / 2,
  }
  const spine = quadPoints(spout, control, streamEnd, 16)
  const streamWidth = (u: number): number => lerp(7.5, 5, u)
  const stream = ribbonContour(spine, streamWidth)

  // Ripples at the surface where the stream lands.
  const ripple = (offset: number): number => {
    const p = (t * 2 + offset) % 1
    return pouring * (1 - p)
  }

  const glassPath = pathFromPoints(
    [
      { x: GLASS.cx - GLASS.topWidth / 2, y: GLASS.top },
      { x: GLASS.cx + GLASS.topWidth / 2, y: GLASS.top },
      { x: GLASS.cx + GLASS.bottomWidth / 2, y: GLASS.bottom },
      { x: GLASS.cx - GLASS.bottomWidth / 2, y: GLASS.bottom },
    ],
    true,
  )

  const glassWaterContour: Pt[] = [
    { x: GLASS.cx - GLASS.bottomWidth / 2 + 2, y: waterTop },
    { x: GLASS.cx + GLASS.bottomWidth / 2 - 2, y: waterTop },
    { x: GLASS.cx + GLASS.bottomWidth / 2 - 4, y: GLASS.bottom - 4 },
    { x: GLASS.cx - GLASS.bottomWidth / 2 + 4, y: GLASS.bottom - 4 },
  ]

  return (
    <SceneBackdrop hue="#63B7D6" floorY={FLOOR}>
      <defs>
        <clipPath id={`${uid}-glass`}>
          <path d={glassPath} />
        </clipPath>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx={GLASS.cx} cy={GLASS.bottom + 10} rx={58} ry={13} fill={palette.warmShadowStrong} filter={`url(#${uid}-soft)`} opacity={0.42} />

<g transform={`translate(${372} ${320}) scale(${1.1}) translate(${-372} ${-320})`}>      {/* glass ------------------------------------------------------------- */}
      <g>
        <path
          d={glassPath}
          fill={palette.glass}
          stroke={palette.glassEdge}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <g clipPath={`url(#${uid}-glass)`}>
          <Ink points={glassWaterContour} smooth fill={palette.water} stroke="none" opacity={0.92} />
          <Ink
            points={glassWaterContour.map((p, i) => (i < 2 ? { x: p.x, y: p.y + 5 } : p))}
            smooth
            fill="#8ED3EA"
            opacity={0.5}
          />
        </g>
        {/* surface line + ripples */}
        <ellipse cx={GLASS.cx} cy={waterTop} rx={GLASS.bottomWidth / 2 - 3} ry={5} fill="#BEE7F3" opacity={0.9} />
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            cx={GLASS.cx + (i - 1) * 4}
            cy={waterTop}
            rx={8 + ripple(i / 3) * 26}
            ry={2.5 + ripple(i / 3) * 5}
            fill="none"
            stroke="#E8F7FC"
            strokeWidth={2}
            opacity={ripple(i / 3) * 0.8}
          />
        ))}
        <path
          d={`M${GLASS.cx - GLASS.topWidth / 2 + 12} ${GLASS.top + 16} L${
            GLASS.cx - GLASS.bottomWidth / 2 + 12
          } ${GLASS.bottom - 18}`}
          stroke="#FFFFFF"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>

      {/* stream ------------------------------------------------------------ */}
      {pouring > 0.02 && (
        <g opacity={clamp(pouring * 1.4)}>
          <Ink points={stream} smooth fill={palette.water} stroke="none" opacity={0.94} />
          <Ink
            points={ribbonContour(spine, (u) => lerp(2.6, 1.8, u))}
            smooth
            fill="#C9ECF7"
            stroke="none"
            opacity={0.85}
          />
          {[0, 1, 2, 3].map((i) => {
            const u = ((t * 3 + i * 0.25) % 1)
            const p = quadPoint(spout, control, streamEnd, u)
            return <Blob key={i} cx={p.x + 8} cy={p.y} rx={2.4} ry={3.6} fill="#BEE7F3" opacity={0.7} />
          })}
        </g>
      )}

      {/* jug --------------------------------------------------------------- */}
      <g transform={`rotate(${tilt} ${JUG.x} ${JUG.y}) translate(0 ${idle * 0.4})`}>
        {/* body */}
        <path
          d={smoothPath(
            [
              { x: JUG.x - 74, y: JUG.y - 66 },
              { x: JUG.x + 74, y: JUG.y - 66 },
              { x: JUG.x + 82, y: JUG.y + 26 },
              { x: JUG.x + 62, y: JUG.y + 76 },
              { x: JUG.x - 62, y: JUG.y + 76 },
              { x: JUG.x - 82, y: JUG.y + 26 },
            ],
            true,
            0.85,
          )}
          fill="#EDF6FA"
          stroke={palette.glassEdge}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        {/* water left inside the jug, draining as the glass fills */}
        <g opacity={clamp(1 - levelTarget * 0.75)}>
          <path
            d={smoothPath(
              [
                { x: JUG.x - 70, y: JUG.y - 4 + tilt * 0.45 },
                { x: JUG.x + 70, y: JUG.y - 18 + tilt * 0.2 },
                { x: JUG.x + 78, y: JUG.y + 30 },
                { x: JUG.x + 58, y: JUG.y + 72 },
                { x: JUG.x - 58, y: JUG.y + 72 },
                { x: JUG.x - 78, y: JUG.y + 30 },
              ],
              true,
              0.85,
            )}
            fill={palette.water}
            opacity={0.9}
          />
          <ellipse cx={JUG.x - 2} cy={JUG.y - 8 + tilt * 0.36} rx={62} ry={9} fill="#9FDCF0" opacity={0.85} />
        </g>
        {/* spout */}
        <path
          d={smoothPath(
            [
              { x: JUG.x + 74, y: JUG.y - 66 },
              { x: JUG.x + 108, y: JUG.y - 52 },
              { x: JUG.x + 106, y: JUG.y - 34 },
              { x: JUG.x + 80, y: JUG.y - 44 },
            ],
            true,
            0.7,
          )}
          fill="#EDF6FA"
          stroke={palette.glassEdge}
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
        {/* rim + highlight */}
        <ellipse cx={JUG.x} cy={JUG.y - 66} rx={74} ry={16} fill="#F7FCFE" stroke={palette.glassEdge} strokeWidth={3} />
        <ellipse cx={JUG.x - 6} cy={JUG.y - 64} rx={58} ry={10} fill={palette.water} opacity={0.55} />
        <path
          d={`M${JUG.x - 54} ${JUG.y - 40} Q ${JUG.x - 66} ${JUG.y + 8} ${JUG.x - 46} ${JUG.y + 48}`}
          stroke="#FFFFFF"
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
          opacity={0.6}
        />
        {/* ear handle */}
        <path
          d={`M${JUG.x - 62} ${JUG.y - 52} Q ${JUG.x - 150} ${JUG.y - 14} ${JUG.x - 58} ${JUG.y + 44}`}
          stroke={palette.glassEdge}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${JUG.x - 62} ${JUG.y - 52} Q ${JUG.x - 150} ${JUG.y - 14} ${JUG.x - 58} ${JUG.y + 44}`}
          stroke="#EDF6FA"
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* jug handle + gripping hand --------------------------------------- */}
      <g opacity={handIn}>
        <Hand
          center={{ x: JUG.x - 122, y: JUG.y - 4 + idle * 0.3 }}
          rotate={84}
          armAngle={34}
          armLength={300}
          fingers={[GRIP[0] * 0.86, GRIP[1] * 0.9, GRIP[2] * 0.9, GRIP[3] * 0.84]}
          thumb={0.66}
          curlDirection={1}
          perspective={1}
          sleeveColor={palette.sleeve}
        />
      </g>

      {pouring > 0.5 && (
        <g opacity={clamp((pouring - 0.5) * 2)}>
          <Sparkle x={GLASS.cx - 60} y={waterTop - 46} size={7} color="#FFFFFF" />
          <Sparkle x={GLASS.cx + 52} y={waterTop - 70} size={5} color="#C9ECF7" rotate={24} />
        </g>
      )}
      </g>
    </SceneBackdrop>
  )
})
