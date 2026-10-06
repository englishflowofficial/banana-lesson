import { animationKeys, sceneRegistry } from '../animations/scenes'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '../components/icons'

const STEPS = [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1]

/**
 * Animation storyboard — a QA and content-review tool for the motion system.
 * Every scene is a pure function of its timeline position, so we can render any
 * frame without playing it, which makes reviewing motion changes quick and
 * keeps visual regressions obvious.
 */
export default function StoryboardPage() {
  return (
    <div className="mx-auto max-w-[1800px] px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-600 hover:text-ink-900"
      >
        <ArrowLeftIcon size={18} /> Back to the app
      </Link>
      <h1 className="mt-4 text-3xl">Animation storyboard</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Nine frames of every action animation, rendered straight from each scene's timeline. Used to
        review motion timing, silhouettes and the finished pose learners answer on.
      </p>

      {animationKeys.map((key) => {
        const entry = sceneRegistry[key]
        const Scene = entry.Component
        return (
          <section key={key} className="mt-10">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-xl">{entry.label}</h2>
              <code className="rounded-md bg-cream-200 px-2 py-0.5 text-xs font-bold text-ink-600">
                {key} · {(entry.durationMs / 1000).toFixed(1)}s · still {entry.stillFrame}
              </code>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {STEPS.map((step) => (
                <figure key={step} className="m-0 w-[300px]">
                  <svg viewBox="0 0 720 560" className="block w-full rounded-xl border border-cream-300 bg-cream-100" role="img" aria-label={`${entry.label} at ${Math.round(step * 100)} percent`}>
                    <Scene t={step} reduced={false} uid={`sb-${key}-${Math.round(step * 100)}`} />
                  </svg>
                  <figcaption className="mt-1 text-center text-xs font-bold text-ink-400">
                    t = {step.toFixed(2)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
