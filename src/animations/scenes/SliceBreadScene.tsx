import { memo } from 'react'
import {
  clamp,
  easeInOutCubic,
  easeOutCubic,
  lerp,
  seg,
  smoothPath,
  type Pt,
} from '../engine/geometry'
import { palette } from '../engine/theme'
import { Hand } from '../engine/Hand'
import { GRIP } from '../engine/handPoses'
import { Blob, SceneBackdrop, Sparkle } from '../engine/primitives'
import type { SceneProps } from './types'

/**
 * "Slicing bread" — a knife saws down through a loaf; the cut slice leans away
 * and the exposed crumb face stays visible.
 */

const BOARD = { x: 168, y: 420, w: 400, h: 26, r: 12 }
const LOAF = { left: 252, right: 492, top: 296, bottom: 420 }
const CUT_X = 336

const loafContour = (left: number, right: number, top: number, bottom: number): Pt[] => {
  const w = right - left
  return [
    { x: left, y: bottom },
    { x: left + w * 0.02, y: top + 34 },
    { x: left + w * 0.2, y: top + 6 },
    { x: left + w * 0.46, y: top - 6 },
    { x: left + w * 0.74, y: top + 2 },
    { x: right - w * 0.04, y: top + 30 },
    { x: right, y: bottom },
  ]
}

export const SliceBreadScene = memo(function SliceBreadScene({ t, uid }: SceneProps) {
  /* knife travels down, sawing sideways as it goes */
  const descend = easeInOutCubic(seg(t, 0.14, 0.56))
  const retract = easeOutCubic(seg(t, 0.8, 0.98))
  const saw = Math.sin(t * Math.PI * 2 * 6) * 7 * descend * (1 - retract)
  const knifeTipY = lerp(178, LOAF.bottom + 18, descend) - retract * 300
  const knifeTopY = knifeTipY - 176

  const cutProgress = clamp((knifeTipY - LOAF.top + 20) / (LOAF.bottom - LOAF.top + 20))
  const separation = easeOutCubic(seg(t, 0.5, 0.84))
  const sliceDrop = easeOutCubic(seg(t, 0.62, 0.92))
  const sliceShift = -46 * separation - 4
  const sliceRotate = -13 * separation

  const breadSlice = loafContour(LOAF.left, CUT_X, LOAF.top, LOAF.bottom)
  const mainLoaf = loafContour(CUT_X, LOAF.right, LOAF.top, LOAF.bottom)

  const knifeBlade: Pt[] = [
    { x: CUT_X - 14, y: knifeTopY },
    { x: CUT_X + 30, y: knifeTopY },
    { x: CUT_X + 34, y: knifeTipY - 22 },
    { x: CUT_X + 16, y: knifeTipY - 4 },
    { x: CUT_X + 2, y: knifeTipY },
    { x: CUT_X - 10, y: knifeTipY - 10 },
  ]

  const handCenter: Pt = { x: CUT_X + 92 + saw, y: knifeTopY - 34 }
  const handIn = clamp(seg(t, 0.0, 0.08) - seg(t, 0.94, 1))

  return (
    <SceneBackdrop hue="#E6BE86" floorY={452}>
      <defs>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

<g transform={`translate(${352} ${350}) scale(${1.16}) translate(${-352} ${-350})`}>      {/* board -------------------------------------------------------------- */}
      <ellipse cx={BOARD.x + BOARD.w / 2} cy={458} rx={210} ry={18} fill={palette.warmShadowStrong} filter={`url(#${uid}-soft)`} opacity={0.4} />
      <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={BOARD.r} fill={palette.wood} stroke={palette.woodShade} strokeWidth={3} />
      <rect x={BOARD.x + 10} y={BOARD.y + 5} width={BOARD.w - 20} height={8} rx={4} fill="#E8BE8A" opacity={0.8} />

      {/* remaining loaf ----------------------------------------------------- */}
      <g>
        <path d={smoothPath(mainLoaf, true, 0.85)} fill={palette.bread} stroke={palette.breadCrust} strokeWidth={4} strokeLinejoin="round" />
        {/* exposed crumb face where the slice came away */}
        <path
          d={smoothPath(
            [
              { x: CUT_X + 1, y: LOAF.bottom - 2 },
              { x: CUT_X + 2, y: LOAF.top + 26 },
              { x: CUT_X + 14, y: LOAF.top + 12 },
              { x: CUT_X + 26, y: LOAF.top + 30 },
              { x: CUT_X + 26, y: LOAF.bottom - 2 },
            ],
            true,
            0.9,
          )}
          fill={palette.breadCrumb}
          opacity={0.95}
        />
        {/* crumb pores */}
        {[
          [CUT_X + 12, LOAF.top + 60],
          [CUT_X + 20, LOAF.top + 92],
          [CUT_X + 10, LOAF.top + 116],
          [CUT_X + 18, LOAF.bottom - 26],
        ].map(([cx, cy], i) => (
          <Blob key={i} cx={cx} cy={cy} rx={2.6} ry={2} fill={palette.breadCrust} opacity={0.4} />
        ))}
        {/* top score marks + flour */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${CUT_X + 44 + i * 34} ${LOAF.top + 10} q 12 -10 22 2`}
            fill="none"
            stroke={palette.breadCrust}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.75}
          />
        ))}
        {[
          [CUT_X + 54, LOAF.top + 1],
          [CUT_X + 116, LOAF.top - 3],
          [CUT_X + 90, LOAF.top + 8],
        ].map(([x, y], i) => (
          <Blob key={i} cx={x} cy={y} rx={3.4} ry={2.2} fill="#FFF6E4" opacity={0.85} />
        ))}
      </g>

      {/* the slice that leans away ------------------------------------------ */}
      <g transform={`translate(${sliceShift} ${sliceDrop * 10}) rotate(${sliceRotate} ${CUT_X - 8} ${LOAF.bottom - 4})`}>
        <path d={smoothPath(breadSlice, true, 0.85)} fill={palette.bread} stroke={palette.breadCrust} strokeWidth={4} strokeLinejoin="round" />
        <path
          d={smoothPath(
            [
              { x: CUT_X - 4, y: LOAF.bottom - 2 },
              { x: CUT_X - 3, y: LOAF.top + 30 },
              { x: CUT_X - 14, y: LOAF.top + 14 },
              { x: CUT_X - 24, y: LOAF.top + 32 },
              { x: CUT_X - 24, y: LOAF.bottom - 2 },
            ],
            true,
            0.9,
          )}
          fill={palette.breadCrumb}
          opacity={0.95}
        />
        <path
          d={`M${LOAF.left + 8} ${LOAF.top + 46} q 16 6 30 -2`}
          fill="none"
          stroke={palette.breadCrust}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.6}
        />
      </g>

      {/* the cut line that grows behind the blade ---------------------------- */}
      {separation < 0.05 && cutProgress > 0.02 && (
        <line
          x1={CUT_X + 8}
          y1={LOAF.top - 4}
          x2={CUT_X + 8}
          y2={lerp(LOAF.top - 4, LOAF.bottom, cutProgress)}
          stroke={palette.breadCrust}
          strokeWidth={3.4}
          strokeLinecap="round"
          opacity={0.55}
        />
      )}

      {/* knife -------------------------------------------------------------- */}
      <g transform={`translate(${saw} 0)`}>
        {/* handle */}
        <rect x={CUT_X - 1} y={knifeTopY - 108} width={36} height={112} rx={16} fill="#4E3C2E" stroke="#33281F" strokeWidth={3.4} />
        <rect x={CUT_X + 6} y={knifeTopY - 98} width={9} height={92} rx={4.5} fill="#7A6455" opacity={0.85} />
        {/* bolster */}
        <rect x={CUT_X - 6} y={knifeTopY - 10} width={44} height={20} rx={7} fill="#9AA5AE" stroke="#6F7A84" strokeWidth={3} />
        {/* blade */}
        <path
          d={smoothPath(knifeBlade, true, 0.2)}
          fill="#E4EAEE"
          stroke="#8B98A2"
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
        <path
          d={`M${CUT_X + 24} ${knifeTopY + 6} L${CUT_X + 26} ${knifeTipY - 26}`}
          stroke="#FFFFFF"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path
          d={`M${CUT_X - 8} ${knifeTopY + 6} L${CUT_X + 4} ${knifeTipY - 12}`}
          stroke="#C3CCD3"
          strokeWidth={3.4}
          strokeLinecap="round"
          opacity={0.8}
        />
      </g>

      {/* hand --------------------------------------------------------------- */}
      <g opacity={handIn}>
        <Hand
          center={handCenter}
          rotate={-30}
          armAngle={-4}
          armLength={330}
          fingers={[GRIP[0] * 0.94, GRIP[1] * 0.96, GRIP[2] * 0.94, GRIP[3] * 0.9]}
          thumb={0.72}
          curlDirection={-1}
          perspective={1.16}
          sleeveColor={palette.sleeve}
        />
      </g>

      {separation > 0.6 && (
        <g opacity={clamp((separation - 0.6) * 2.5)}>
          <Sparkle x={CUT_X - 78} y={LOAF.top + 30} size={10} color="#FFFFFF" />
          <Sparkle x={CUT_X + 40} y={LOAF.top - 26} size={7} color="#FFF3C4" rotate={20} />
        </g>
      )}
      </g>
    </SceneBackdrop>
  )
})
