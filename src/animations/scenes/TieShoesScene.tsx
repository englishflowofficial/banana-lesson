import { memo } from 'react'
import {
  clamp,
  easeOutBackSoft,
  easeOutCubic,
  easeOutSoft,
  lerp,
  type Pt,
  ribbonContour,
  quadPoints,
  seg,
  smoothPath,
  lerpPt,
} from '../engine/geometry'
import { palette } from '../engine/theme'
import { Hand } from '../engine/Hand'
import { Blob, SceneBackdrop, Sparkle } from '../engine/primitives'
import type { SceneProps } from './types'

/**
 * "Tying your shoes" — the lace ends cross, two loops grow out of the knot and
 * the bow pulls tight. Pure geometry, so the bow genuinely assembles.
 */

const KNOT: Pt = { x: 366, y: 352 }

/** Teardrop loop whose point sits exactly on the knot. */
function loopContour(angleDeg: number, length: number, width: number, samples = 26): Pt[] {
  const ang = (angleDeg * Math.PI) / 180
  const bulb: Pt = { x: KNOT.x + Math.cos(ang) * length, y: KNOT.y + Math.sin(ang) * length }
  const out: Pt[] = []
  for (let i = 0; i < samples; i++) {
    const th = (i / samples) * Math.PI * 2
    const base: Pt = { x: bulb.x + width * Math.cos(th), y: bulb.y + width * Math.sin(th) }
    const pull = Math.pow((1 - Math.cos(th - ang)) / 2, 1.35) * 0.94
    out.push(lerpPt(base, KNOT, pull))
  }
  return out
}

/** Wavy lace end hanging away from the knot. */
function laceEnd(directionDeg: number, length: number, wave: number, width: number): Pt[] {
  const ang = (directionDeg * Math.PI) / 180
  const tip: Pt = { x: KNOT.x + Math.cos(ang) * length, y: KNOT.y + Math.sin(ang) * length }
  const control: Pt = {
    x: KNOT.x + Math.cos(ang) * length * 0.55 - Math.sin(ang) * wave,
    y: KNOT.y + Math.sin(ang) * length * 0.55 + Math.cos(ang) * wave,
  }
  return ribbonContour(quadPoints(KNOT, control, tip, 12), (u) => lerp(width, width * 0.7, u))
}

export const TieShoesScene = memo(function TieShoesScene({ t, uid }: SceneProps) {
  const cross = easeOutSoft(seg(t, 0.06, 0.34))
  const leftLoop = easeOutBackSoft(seg(t, 0.3, 0.56))
  const rightLoop = easeOutBackSoft(seg(t, 0.5, 0.76))
  const tighten = easeOutCubic(seg(t, 0.72, 0.88))
  const settle = 1 + Math.sin(clamp(seg(t, 0.84, 1)) * Math.PI) * 0.05
  const sparkle = clamp(seg(t, 0.86, 0.95) - seg(t, 0.98, 1))

  const handIn = easeOutSoft(seg(t, 0.02, 0.12))
  const handOut = easeOutCubic(seg(t, 0.32, 0.46))
  const handCenter: Pt = {
    x: lerp(KNOT.x + 164, KNOT.y * 0 + 232, handIn) + handOut * 80,
    y: lerp(KNOT.y - 58, KNOT.y - 96, handIn) - handOut * 110,
  }

  const bob = Math.sin(t * Math.PI * 2) * 1.6
  const shoeY = bob
  const laceColor = '#FFF6E2'
  const laceEdge = '#D8C49B'

  const eyelets: Pt[] = [
    { x: 306, y: 412 },
    { x: 340, y: 400 },
    { x: 374, y: 388 },
    { x: 404, y: 374 },
  ]

  return (
    <SceneBackdrop hue="#D95C4A" floorY={470}>
      <defs>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx={356} cy={478} rx={186} ry={18} fill={palette.warmShadowStrong} filter={`url(#${uid}-soft)`} opacity={0.4} />

<g transform={`translate(${356} ${404}) scale(${1.22}) translate(${-356} ${-404})`}>      <g transform={`translate(0 ${shoeY})`}>
        {/* shoe body */}
        <path
          d={smoothPath(
            [
              { x: 206, y: 432 },
              { x: 214, y: 396 },
              { x: 258, y: 372 },
              { x: 320, y: 362 },
              { x: 386, y: 352 },
              { x: 452, y: 346 },
              { x: 492, y: 356 },
              { x: 508, y: 396 },
              { x: 512, y: 432 },
            ],
            true,
            0.9,
          )}
          fill={palette.shoeBody}
          stroke="#A33F32"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* toe cap + heel accents */}
        <path
          d={smoothPath(
            [
              { x: 214, y: 400 },
              { x: 258, y: 374 },
              { x: 300, y: 366 },
              { x: 302, y: 404 },
              { x: 250, y: 412 },
            ],
            true,
            0.85,
          )}
          fill="#F0E4D2"
          opacity={0.9}
        />
        <path
          d={smoothPath(
            [
              { x: 452, y: 348 },
              { x: 496, y: 360 },
              { x: 508, y: 400 },
              { x: 470, y: 404 },
            ],
            true,
            0.85,
          )}
          fill="#F0E4D2"
          opacity={0.85}
        />
        {/* collar / tongue */}
        <path
          d={smoothPath(
            [
              { x: 392, y: 354 },
              { x: 420, y: 344 },
              { x: 462, y: 340 },
              { x: 470, y: 366 },
              { x: 424, y: 380 },
              { x: 398, y: 376 },
            ],
            true,
            0.9,
          )}
          fill="#B8483B"
          stroke="#A33F32"
          strokeWidth={3}
        />
        {/* sole */}
        <path
          d={smoothPath(
            [
              { x: 198, y: 432 },
              { x: 512, y: 432 },
              { x: 516, y: 452 },
              { x: 500, y: 464 },
              { x: 214, y: 464 },
              { x: 196, y: 452 },
            ],
            true,
            0.8,
          )}
          fill={palette.shoeSole}
          stroke={laceEdge}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        <path d={`M204 445 H508`} stroke={laceEdge} strokeWidth={3} strokeLinecap="round" opacity={0.8} />

        {/* eyelets */}
        {eyelets.map((e, i) => (
          <g key={i}>
            <circle cx={e.x} cy={e.y} r={7} fill="#7C6250" />
            <circle cx={e.x} cy={e.y} r={3.4} fill="#4A3B30" />
          </g>
        ))}

        {/* laces running through the eyelets, pulled tight as the bow ties */}
        {[0, 1, 2].map((i) => {
          const a = eyelets[i]
          const b = eyelets[i + 1]
          const sag = lerp(14, 2, cross)
          return (
            <path
              key={i}
              d={`M${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`}
              stroke={laceColor}
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
            />
          )
        })}

        {/* the X where the two ends cross, then the knot */}
        <g>
          <path
            d={`M${lerp(eyelets[3].x - 66, KNOT.x - 26, cross)} ${lerp(eyelets[3].y - 132, KNOT.y - 45, cross)} L${
              KNOT.x
            } ${KNOT.y}`}
            stroke={laceColor}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={clamp(1 - rightLoop * 0.85)}
          />
          <path
            d={`M${lerp(eyelets[3].x + 70, KNOT.x + 28, cross)} ${lerp(eyelets[3].y - 128, KNOT.y - 48, cross)} L${
              KNOT.x
            } ${KNOT.y}`}
            stroke={laceColor}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={clamp(1 - leftLoop * 0.85)}
          />
          {/* the two loose ends from the top eyelets */}
          <path
            d={`M${eyelets[3].x} ${eyelets[3].y} Q ${eyelets[3].x + 38} ${eyelets[3].y - 24} ${
              KNOT.x - 10
            } ${KNOT.y + 6}`}
            stroke={laceColor}
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M${eyelets[2].x} ${eyelets[2].y} Q ${eyelets[2].x + 46} ${eyelets[2].y - 40} ${
              KNOT.x + 8
            } ${KNOT.y + 8}`}
            stroke={laceColor}
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
          />
          <Blob cx={KNOT.x} cy={KNOT.y} rx={15 * (0.6 + cross * 0.5)} ry={11 * (0.6 + cross * 0.5)} fill={laceColor} stroke={laceEdge} strokeWidth={2.4} />

          {/* loops */}
          {leftLoop > 0.02 && (
            <path
              d={smoothPath(loopContour(206, lerp(10, 72, leftLoop), lerp(6, 34, leftLoop)), true, 0.9)}
              fill={laceColor}
              stroke={laceEdge}
              strokeWidth={2.6}
              strokeLinejoin="round"
              opacity={clamp(leftLoop * 1.4)}
              transform={`scale(${settle}) translate(${KNOT.x * (1 / settle - 1)} ${KNOT.y * (1 / settle - 1)})`}
            />
          )}
          {rightLoop > 0.02 && (
            <path
              d={smoothPath(loopContour(-26, lerp(10, 76, rightLoop), lerp(6, 35, rightLoop)), true, 0.9)}
              fill={laceColor}
              stroke={laceEdge}
              strokeWidth={2.6}
              strokeLinejoin="round"
              opacity={clamp(rightLoop * 1.4)}
              transform={`scale(${settle}) translate(${KNOT.x * (1 / settle - 1)} ${KNOT.y * (1 / settle - 1)})`}
            />
          )}

          {/* hanging ends */}
          {[
            laceEnd(118, lerp(96, 54, tighten), 18, 9),
            laceEnd(60, lerp(104, 60, tighten), -20, 9),
          ].map((pts, i) => (
            <path
              key={i}
              d={smoothPath(pts, true, 0.8)}
              fill={laceColor}
              stroke={laceEdge}
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </g>

      {/* hand pulling the end taut ------------------------------------------ */}
      <g opacity={handIn * (1 - handOut)}>
        <Hand
          center={handCenter}
          rotate={-124}
          armAngle={-8}
          armLength={280}
          fingers={[clamp(0.55, 0, 1), 0.6, 0.62, 0.68]}
          thumb={0.5}
          curlDirection={1}
          perspective={0.96}
          sleeveColor={palette.sleeveShade}
        />
      </g>

      {sparkle > 0.05 && (
        <g opacity={sparkle}>
          <Sparkle x={KNOT.x - 92} y={KNOT.y - 56} size={12} color="#FFFFFF" />
          <Sparkle x={KNOT.x + 104} y={KNOT.y - 34} size={9} color="#FFE79A" rotate={22} />
          <Sparkle x={KNOT.x + 12} y={KNOT.y + 42} size={7} color="#FFFFFF" rotate={-14} />
        </g>
      )}
      </g>
    </SceneBackdrop>
  )
})
