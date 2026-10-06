import { memo } from 'react'
import {
  clamp,
  cubicPoint,
  droplet,
  easeOutBackSoft,
  easeOutCubic,
  easeOutSoft,
  lerp,
  type Pt,
  seg,
  smoothPath,
} from '../engine/geometry'
import { palette } from '../engine/theme'
import { Hand } from '../engine/Hand'
import { GRIP } from '../engine/handPoses'
import { Blob, SceneBackdrop, Sparkle } from '../engine/primitives'
import type { SceneProps } from './types'

/**
 * "Watering a plant" — a watering can tips forward, droplets fall on the soil
 * and the plant perks up, sending out one fresh leaf.
 */

const CAN = { x: 486, y: 214 }
const SPOUT_LOCAL: Pt = { x: -128, y: 24 }
const POT = { cx: 276, top: 372, bottom: 470, topWidth: 168, bottomWidth: 118 }
const CROWN: Pt = { x: 276, y: 372 }

const spoutWorld = (tiltDeg: number): Pt => {
  const rad = (tiltDeg * Math.PI) / 180
  return {
    x: CAN.x + SPOUT_LOCAL.x * Math.cos(rad) - SPOUT_LOCAL.y * Math.sin(rad),
    y: CAN.y + SPOUT_LOCAL.x * Math.sin(rad) + SPOUT_LOCAL.y * Math.cos(rad),
  }
}

/** Leaf blade: a teardrop contour plus a midrib. */
function leafShape(base: Pt, angleDeg: number, length: number, width: number): Pt[] {
  const rad = (angleDeg * Math.PI) / 180
  const tip: Pt = { x: base.x + Math.cos(rad) * length, y: base.y + Math.sin(rad) * length }
  const mid: Pt = { x: (base.x + tip.x) / 2, y: (base.y + tip.y) / 2 }
  const perp = rad + Math.PI / 2
  const bulge = { x: Math.cos(perp) * width, y: Math.sin(perp) * width }
  return [
    base,
    { x: mid.x + bulge.x * 0.55, y: mid.y + bulge.y * 0.55 },
    { x: tip.x + bulge.x * 0.08, y: tip.y + bulge.y * 0.08 },
    tip,
    { x: mid.x - bulge.x * 0.55, y: mid.y - bulge.y * 0.55 },
  ]
}

export const WaterPlantScene = memo(function WaterPlantScene({ t, uid }: SceneProps) {
  const tilt = lerp(0, 30, easeOutSoft(seg(t, 0.06, 0.2))) * (1 - easeOutCubic(seg(t, 0.86, 1)))
  const flowing = clamp(seg(t, 0.16, 0.24) - seg(t, 0.82, 0.92))
  const drink = easeOutCubic(seg(t, 0.3, 0.86))
  const newLeaf = easeOutBackSoft(seg(t, 0.62, 0.9))
  const sparkle = clamp(seg(t, 0.74, 0.86) - seg(t, 0.96, 1))

  const spout = spoutWorld(tilt)
  const bounce = Math.sin(t * Math.PI * 3) * 1.4

  const droplets = Array.from({ length: 14 }, (_, i) => {
    const p = ((t * 1.7 + i / 14) % 1)
    const from = { x: spout.x - 6, y: spout.y + 6 }
    const to = { x: CROWN.x + ((i % 5) - 2) * 26, y: CROWN.y - 12 }
    const mid = { x: (from.x + to.x) / 2 + 12, y: from.y + (to.y - from.y) * 0.5 }
    const point = cubicPoint(from, { x: mid.x + 6, y: mid.y - 22 }, { x: mid.x - 8, y: mid.y + 18 }, to, clamp(p * 1.15))
    return { point, alive: flowing * clamp(p * 4) * clamp((1 - p) * 5), scale: 1 - p * 0.35 }
  })

  const leafBase: Pt = { x: CROWN.x + 4, y: CROWN.y - 44 }
  const leaves = [
    { angle: lerp(168, 196, drink), length: 132, width: 34, phase: 0, color: palette.leaf },
    { angle: lerp(-16, -46, drink), length: 118, width: 30, phase: 1, color: palette.leafDark },
    { angle: lerp(-84, -92, drink), length: 142, width: 32, phase: 2, color: palette.leafLight },
    { angle: lerp(-34, -22, drink), length: 96, width: 24, phase: 3, color: palette.leaf },
  ]

  const soilDark = drink

  return (
    <SceneBackdrop hue="#7FC8A9" floorY={470}>
      <defs>
        <clipPath id={`${uid}-soil`}>
          <ellipse cx={POT.cx} cy={POT.top + 22} rx={POT.topWidth / 2 - 6} ry={16} />
        </clipPath>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id={`${uid}-pot`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D98A5C" />
          <stop offset="55%" stopColor={palette.pot} />
          <stop offset="100%" stopColor={palette.potShade} />
        </linearGradient>
      </defs>

      <ellipse cx={POT.cx} cy={482} rx={118} ry={18} fill={palette.warmShadowStrong} filter={`url(#${uid}-soft)`} opacity={0.4} />

<g transform={`translate(${340} ${340}) scale(${1.08}) translate(${-340} ${-340})`}>      {/* plant -------------------------------------------------------------- */}
      <g transform={`translate(0 ${bounce})`}>
        {/* stem */}
        <path
          d={`M${CROWN.x} ${CROWN.y + 4} C ${CROWN.x - 8} ${CROWN.y - 46} ${CROWN.x + 6} ${
            CROWN.y - 84
          } ${leafBase.x} ${leafBase.y}`}
          stroke={palette.leafDark}
          strokeWidth={11}
          strokeLinecap="round"
          fill="none"
        />
        {/* existing leaves */}
        {leaves.map((leaf, i) => {
          const angle = leaf.angle + Math.sin(t * Math.PI * 2 + i) * 1.4
          const pts = leafShape(leafBase, angle, leaf.length * lerp(0.86, 1, drink), leaf.width)
          const tip = pts[2]
          return (
            <g key={i}>
              <path d={smoothPath(pts, true, 0.9)} fill={leaf.color} stroke={palette.leafDark} strokeWidth={3} strokeLinejoin="round" />
              <path
                d={`M${leafBase.x} ${leafBase.y} Q ${(leafBase.x + tip.x) / 2 + (i % 2 ? 6 : -6)} ${
                  (leafBase.y + tip.y) / 2
                } ${tip.x} ${tip.y}`}
                stroke="#EAF7EF"
                strokeWidth={2.4}
                fill="none"
                opacity={0.7}
              />
            </g>
          )
        })}
        {/* the new leaf that unfurls at the end */}
        {newLeaf > 0.02 && (
          <path
            d={smoothPath(
              leafShape(leafBase, -140 - 12 * (1 - newLeaf), 92 * newLeaf, 22 * newLeaf),
              true,
              0.9,
            )}
            fill="#8FD3B3"
            stroke={palette.leafDark}
            strokeWidth={3}
            strokeLinejoin="round"
            opacity={clamp(newLeaf * 1.6)}
          />
        )}
      </g>

      {/* pot ---------------------------------------------------------------- */}
      <g>
        <path
          d={smoothPath(
            [
              { x: POT.cx - POT.topWidth / 2, y: POT.top + 14 },
              { x: POT.cx + POT.topWidth / 2, y: POT.top + 14 },
              { x: POT.cx + POT.bottomWidth / 2, y: POT.bottom },
              { x: POT.cx - POT.bottomWidth / 2, y: POT.bottom },
            ],
            true,
            0.08,
          )}
          fill={`url(#${uid}-pot)`}
          stroke={palette.potShade}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        {/* rim */}
        <path
          d={smoothPath(
            [
              { x: POT.cx - POT.topWidth / 2 - 10, y: POT.top },
              { x: POT.cx + POT.topWidth / 2 + 10, y: POT.top },
              { x: POT.cx + POT.topWidth / 2 + 4, y: POT.top + 30 },
              { x: POT.cx - POT.topWidth / 2 - 4, y: POT.top + 30 },
            ],
            true,
            0.12,
          )}
          fill={palette.pot}
          stroke={palette.potShade}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        {/* soil */}
        <ellipse cx={POT.cx} cy={POT.top + 18} rx={POT.topWidth / 2 - 8} ry={17} fill={palette.soil} />
        <g clipPath={`url(#${uid}-soil)`}>
          <ellipse
            cx={POT.cx}
            cy={POT.top + 18}
            rx={POT.topWidth / 2 - 8}
            ry={17}
            fill="#3E2C1E"
            opacity={0.85 * soilDark}
          />
        </g>
        {/* pot highlight */}
        <path
          d={`M${POT.cx - POT.topWidth / 2 + 26} ${POT.top + 40} L${POT.cx - POT.bottomWidth / 2 + 20} ${
            POT.bottom - 14
          }`}
          stroke="#F0C69F"
          strokeWidth={9}
          strokeLinecap="round"
          opacity={0.5}
        />
      </g>

      {/* watering can -------------------------------------------------------- */}
      <g transform={`rotate(${tilt} ${CAN.x} ${CAN.y}) translate(0 ${bounce * 0.5})`}>
        <path
          d={smoothPath(
            [
              { x: CAN.x - 66, y: CAN.y - 52 },
              { x: CAN.x + 66, y: CAN.y - 52 },
              { x: CAN.x + 74, y: CAN.y + 34 },
              { x: CAN.x - 74, y: CAN.y + 34 },
            ],
            true,
            0.35,
          )}
          fill={palette.metal}
          stroke={palette.metalShade}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <ellipse cx={CAN.x} cy={CAN.y - 52} rx={66} ry={14} fill="#DFE6EC" stroke={palette.metalShade} strokeWidth={3} />
        {/* spout */}
        <path
          d={smoothPath(
            [
              { x: CAN.x - 64, y: CAN.y - 24 },
              { x: CAN.x - 132, y: CAN.y + 14 },
              { x: CAN.x - 138, y: CAN.y + 30 },
              { x: CAN.x - 62, y: CAN.y + 4 },
            ],
            true,
            0.5,
          )}
          fill={palette.metal}
          stroke={palette.metalShade}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        {/* rose (sprinkler head) */}
        <ellipse cx={CAN.x - 136} cy={CAN.y + 24} rx={12} ry={18} fill="#B9C2CA" stroke={palette.metalShade} strokeWidth={3} transform={`rotate(${-18} ${CAN.x - 136} ${CAN.y + 24})`} />
        {/* handle */}
        <path
          d={`M${CAN.x - 40} ${CAN.y - 56} Q ${CAN.x + 6} ${CAN.y - 128} ${CAN.x + 52} ${CAN.y - 56}`}
          stroke={palette.metalShade}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${CAN.x - 40} ${CAN.y - 56} Q ${CAN.x + 6} ${CAN.y - 128} ${CAN.x + 52} ${CAN.y - 56}`}
          stroke={palette.metal}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${CAN.x - 46} ${CAN.y - 20} L${CAN.x - 46} ${CAN.y + 24}`}
          stroke="#FFFFFF"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>

      {/* water droplets ----------------------------------------------------- */}
      {flowing > 0.05 &&
        droplets.map((d, i) =>
          d.alive > 0.05 ? (
            <path
              key={i}
              d={smoothPath(
                droplet(d.point.x, d.point.y, 6 * d.scale, 8 * d.scale),
                true,
                0.9,
              )}
              fill={palette.water}
              stroke={palette.waterDeep}
              strokeWidth={1.8}
              opacity={clamp(d.alive) * 0.95}
            />
          ) : null,
        )}
      {flowing > 0.3 && (
        <g opacity={clamp((flowing - 0.3) * 1.6)}>
          <Blob cx={CROWN.x - 8} cy={CROWN.y - 6} rx={26} ry={7} fill="#6E93A8" opacity={0.5} />
          <Blob cx={CROWN.x + 30} cy={CROWN.y - 2} rx={16} ry={5} fill="#6E93A8" opacity={0.4} />
        </g>
      )}

      {/* hand holding the can ----------------------------------------------- */}
      <g>
        <Hand
          center={{ x: CAN.x + 12, y: CAN.y - 96 + bounce * 0.4 }}
          rotate={16}
          armAngle={-24}
          armLength={300}
          fingers={[GRIP[0] * 0.92, GRIP[1] * 0.94, GRIP[2] * 0.92, GRIP[3] * 0.86]}
          thumb={0.72}
          curlDirection={1}
          perspective={1.02}
          sleeveColor={palette.sleeve}
        />
      </g>

      {sparkle > 0.05 && (
        <g opacity={sparkle}>
          <Sparkle x={leafBase.x - 118} y={leafBase.y - 26} size={12} color="#FFFFFF" />
          <Sparkle x={leafBase.x + 116} y={leafBase.y - 6} size={9} color="#D5F2DE" rotate={20} />
          <Sparkle x={leafBase.x - 6} y={leafBase.y - 122} size={8} color="#FFF3C4" rotate={-16} />
        </g>
      )}
      </g>
    </SceneBackdrop>
  )
})
