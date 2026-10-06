import { memo } from 'react'
import { clamp, easeOutCubic, seg, smoothPath, type Pt } from '../engine/geometry'
import { palette } from '../engine/theme'
import { Hand } from '../engine/Hand'
import { GRIP } from '../engine/handPoses'
import { Blob, SceneBackdrop, Sparkle } from '../engine/primitives'
import type { SceneProps } from './types'

/**
 * "Brushing your teeth" — a friendly side view of a head with a toothbrush in
 * the mouth. The profile silhouette makes the action readable at a glance, and
 * the brush scrubs up and down on a smooth rhythm while foam builds up.
 */

const MOUTH: Pt = { x: 452, y: 330 }

/** Head silhouette facing right: skull, forehead, nose, lips, chin, jaw, neck. */
const HEAD_PROFILE: Pt[] = [
  { x: 230, y: 112 },
  { x: 330, y: 100 },
  { x: 412, y: 142 },
  { x: 438, y: 206 },
  { x: 444, y: 250 },
  { x: 480, y: 292 },
  { x: 446, y: 304 },
  { x: 452, y: 318 },
  { x: 444, y: 332 },
  { x: 452, y: 346 },
  { x: 446, y: 380 },
  { x: 400, y: 412 },
  { x: 352, y: 428 },
  { x: 348, y: 478 },
  { x: 236, y: 476 },
  { x: 210, y: 404 },
  { x: 180, y: 300 },
  { x: 184, y: 198 },
]

const LOOP = (v: number, cycles: number, phase = 0): number =>
  Math.sin((v * cycles + phase) * Math.PI * 2)

export const BrushTeethScene = memo(function BrushTeethScene({ t, uid }: SceneProps) {
  const brushing = clamp(seg(t, 0.05, 0.13) - seg(t, 0.88, 1))
  const scrub = LOOP(t, 2.6) * 26 * brushing
  const bite = LOOP(t, 5.2) * 5 * brushing
  const tilt = -16 + LOOP(t, 2.6) * 9 * brushing

  const foam = easeOutCubic(seg(t, 0.15, 0.8))
  const clean = clamp(seg(t, 0.74, 0.94)) * (1 - seg(t, 0.99, 1))

  const brushPivot: Pt = { x: MOUTH.x - 6, y: MOUTH.y - 4 }
  const handleAngle = tilt + 8

  const bubbles = Array.from({ length: 10 }, (_, i) => {
    const seed = (i * 43) % 89
    const appearsAt = 0.14 + (i / 10) * 0.6
    const alive = clamp((foam - appearsAt) * 3.6)
    return {
      x: MOUTH.x - 4 + ((seed * 1.3) % 74) + Math.sin(t * 8 + i) * 5 + scrub * 0.4,
      y: MOUTH.y - 34 + ((seed * 1.9) % 44) + Math.cos(t * 10 + i) * 3,
      r: 3.6 + ((seed * 0.1) % 6),
      alive,
    }
  })

  return (
    <SceneBackdrop hue="#87C8E8" floorY={520} showFloor={false}>
      <defs>
        <clipPath id={`${uid}-head`}>
          <path d={smoothPath(HEAD_PROFILE, true, 0.85)} />
        </clipPath>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* ------------------------------ head ------------------------------- */}
      <g>
        {/* shoulders */}
        <path
          d={smoothPath(
            [
              { x: 268, y: 424 },
              { x: 350, y: 424 },
              { x: 372, y: 470 },
              { x: 404, y: 498 },
              { x: 180, y: 520 },
              { x: 214, y: 480 },
              { x: 244, y: 448 },
            ],
            true,
            0.85,
          )}
          fill={palette.sleeve}
          stroke={palette.skinLine}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        {/* head */}
        <path
          d={smoothPath(HEAD_PROFILE, true, 0.85)}
          fill={palette.skin}
          stroke={palette.skinLine}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        <g clipPath={`url(#${uid}-head)`}>
          <Blob cx={402} cy={356} rx={60} ry={42} fill="#E0857E" opacity={0.26} filter={`url(#${uid}-soft)`} />
        </g>
        {/* ear */}
        <path
          d="M236 258 C 210 244 200 288 214 312 C 226 330 250 326 250 306 C 240 292 236 274 236 258 Z"
          fill={palette.skin}
          stroke={palette.skinLine}
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
        <path
          d="M232 274 C 220 272 218 296 228 306"
          fill="none"
          stroke={palette.skinShade}
          strokeWidth={2.8}
          strokeLinecap="round"
        />
        {/* hair cap */}
        <path
          d="M182 202 C 188 122 272 84 350 100 C 418 114 448 158 442 210 C 430 166 384 140 322 136 C 262 132 206 154 182 202 Z"
          fill="#4A3B30"
        />
        <path
          d="M262 108 C 306 96 362 104 396 128 C 352 112 302 110 262 108 Z"
          fill="#6B584A"
          opacity={0.85}
        />
        {/* closed, content eye + eyebrow */}
        <path d="M384 232 C 394 220 412 220 422 230" fill="none" stroke="#4A3B30" strokeWidth={5} strokeLinecap="round" />
        <path d="M376 202 C 392 190 414 192 424 200" fill="none" stroke="#4A3B30" strokeWidth={5} strokeLinecap="round" opacity={0.85} />

        {/* lips */}
        <path
          d="M440 306 C 452 300 468 296 478 300 C 478 308 466 314 452 314 C 446 314 442 310 440 306 Z"
          fill="#C9635C"
          stroke="#A8443F"
          strokeWidth={2.4}
        />
        <path
          d="M442 350 C 452 346 468 344 476 346 C 472 356 460 360 448 358 C 444 357 442 354 442 350 Z"
          fill="#C9635C"
          stroke="#A8443F"
          strokeWidth={2.4}
        />
        {/* open mouth with a hint of teeth, in which the brush sits */}
        <path
          d="M438 306 C 464 300 484 312 482 332 C 480 350 460 358 440 354 C 432 338 432 320 438 306 Z"
          fill="#7C3336"
          stroke="#8E4346"
          strokeWidth={2}
        />
        <g transform={`translate(0 ${bite * 0.6})`}>
          <path d="M442 312 C 458 308 472 314 474 324 C 452 328 444 322 442 312 Z" fill="#FFFDF6" />
          <path d="M444 350 C 458 348 470 342 476 344 C 470 352 456 356 444 354 Z" fill="#FFF8EC" />
        </g>
      </g>

      {/* ---------------------------- toothbrush ---------------------------- */}
      <g transform={`translate(${scrub * 0.5} ${bite})`}>
        <g transform={`rotate(${handleAngle} ${brushPivot.x} ${brushPivot.y})`}>
          {/* hand holding the handle */}
          <Hand
            center={{ x: brushPivot.x + 186, y: brushPivot.y - 30 }}
            rotate={-56}
            armAngle={44}
            armLength={330}
            fingers={[GRIP[0] * 0.95, GRIP[1] * 0.96, GRIP[2] * 0.94, GRIP[3] * 0.9]}
            thumb={0.74}
            curlDirection={-1}
            perspective={1.22}
            sleeveColor={palette.sleeveShade}
          />
          {/* handle */}
          <path
            d={smoothPath(
              [
                { x: brushPivot.x + 38, y: brushPivot.y - 15 },
                { x: brushPivot.x + 178, y: brushPivot.y - 62 },
                { x: brushPivot.x + 186, y: brushPivot.y - 40 },
                { x: brushPivot.x + 46, y: brushPivot.y + 15 },
              ],
              true,
              0.7,
            )}
            fill="#F4F8FA"
            stroke="#8FA5B4"
            strokeWidth={3.2}
            strokeLinejoin="round"
          />
          <path
            d={smoothPath(
              [
                { x: brushPivot.x + 46, y: brushPivot.y + 3 },
                { x: brushPivot.x + 184, y: brushPivot.y - 45 },
                { x: brushPivot.x + 186, y: brushPivot.y - 32 },
                { x: brushPivot.x + 48, y: brushPivot.y + 13 },
              ],
              true,
              0.7,
            )}
            fill="#8FD3B3"
            stroke="#4E9377"
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          {/* brush head + bristles */}
          <rect x={brushPivot.x - 48} y={brushPivot.y - 18} width={92} height={36} rx={15} fill="#FFFFFF" stroke="#8FA5B4" strokeWidth={3} />
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={i}
              x1={brushPivot.x - 36 + i * 13}
              y1={brushPivot.y - 16}
              x2={brushPivot.x - 36 + i * 13}
              y2={brushPivot.y - 34}
              stroke="#FFFFFF"
              strokeWidth={5.6}
              strokeLinecap="round"
            />
          ))}
        </g>
      </g>

      {/* ------------------------------- foam -------------------------------- */}
      {bubbles.map((b, i) =>
        b.alive > 0.03 ? (
          <Blob
            key={i}
            cx={b.x}
            cy={b.y}
            rx={b.r * b.alive}
            ry={b.r * b.alive * 0.94}
            fill="#FFFFFF"
            opacity={0.94 * b.alive}
          />
        ) : null,
      )}
      {foam > 0.2 && (
        <g opacity={clamp((foam - 0.2) * 2)}>
          <Blob cx={MOUTH.x - 22} cy={MOUTH.y - 30} rx={20} ry={15} fill="#FFFFFF" opacity={0.96} />
          <Blob cx={MOUTH.x + 8} cy={MOUTH.y - 54} rx={13} ry={10} fill="#FFFFFF" opacity={0.9} />
          <Blob cx={MOUTH.x - 44} cy={MOUTH.y + 6} rx={10} ry={8} fill="#FFFFFF" opacity={0.85} />
        </g>
      )}

      {clean > 0.25 && (
        <g opacity={clamp((clean - 0.25) * 2)}>
          <Sparkle x={MOUTH.x + 92} y={MOUTH.y - 128} size={14} color="#FFFFFF" />
          <Sparkle x={MOUTH.x - 92} y={MOUTH.y - 92} size={10} color="#FFF3C4" rotate={18} />
          <Sparkle x={MOUTH.x + 30} y={MOUTH.y + 92} size={8} color="#FFFFFF" rotate={-12} />
        </g>
      )}
    </SceneBackdrop>
  )
})
