/**
 * Offline frame renderer for the animation system (used by `tools/render-frames.mjs`).
 *
 * Scenes are pure functions of their timeline position, so this module can turn
 * any lesson animation into a single static SVG file at any point in time —
 * handy for design review, storyboards and regression screenshots.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { animationKeys, sceneRegistry, type AnimationKey } from '../src/animations/scenes'

export { animationKeys }

export function sceneFrameSvg(key: AnimationKey, t: number, width = 720): string {
  const entry = sceneRegistry[key]
  const Scene = entry.Component
  return renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 560"
      width={width}
      height={Math.round((width * 560) / 720)}
    >
      <Scene t={t} reduced={false} uid={`frame-${key}-${Math.round(t * 1000)}`} />
    </svg>,
  )
}

export const sceneMeta = (key: AnimationKey) => ({
  durationMs: sceneRegistry[key].durationMs,
  stillFrame: sceneRegistry[key].stillFrame,
  label: sceneRegistry[key].label,
})
