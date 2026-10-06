import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SpeakButton } from '../components/SpeakButton'
import { ButtonLink, EmptyState, Pill, ProgressBar, ProgressRing, SectionHeading, StatCard } from '../components/ui'
import { CheckIcon, ChartIcon, FlameIcon, SparklesIcon, TrophyIcon } from '../components/icons'
import { useProgress } from '../hooks/useProgress'
import { categoryById } from '../data/categories'

export default function ProgressPage() {
  const { summary, statuses, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)

  const untouched = summary.answered === 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Your progress"
        title="How your English is growing"
        description="Everything here is stored in this browser only — no account, no tracking, nothing sent anywhere."
        level={1}
      />

      {untouched ? (
        <div className="mt-8">
          <EmptyState
            title="No answers yet"
            description="Finish your first lesson and this page will fill up with your accuracy, your daily streak and the phrases you have learned."
            action={<ButtonLink to="/lesson/peeling-a-banana">Start with peeling a banana</ButtonLink>}
          />
        </div>
      ) : (
        <>
          {/* ------------------------------ top stats ------------------------ */}
          <div className="mt-6 grid gap-4 lg:grid-cols-[auto_1fr] lg:items-stretch">
            <div className="card-surface grid place-items-center p-6">
              <ProgressRing
                ratio={summary.completionRatio}
                label={`${summary.completedLessons}/${summary.totalLessons}`}
                sublabel="lessons done"
              />
              <p className="mt-3 mb-0 text-sm font-bold text-ink-500">
                {Math.round(summary.completionRatio * 100)}% of the library
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={<CheckIcon size={22} />}
                value={`${summary.completedLessons}`}
                label="Lessons completed"
                hint={`of ${summary.totalLessons} available`}
                tone="leaf"
              />
              <StatCard
                icon={<ChartIcon size={22} />}
                value={`${Math.round(summary.accuracy * 100)}%`}
                label="Answer accuracy"
                hint={`${summary.correct} correct of ${summary.answered} answers`}
                tone="lagoon"
              />
              <StatCard
                icon={<FlameIcon size={22} />}
                value={`${summary.streak}`}
                label={summary.streak === 1 ? 'Day on streak' : 'Days on streak'}
                hint="Finish a lesson each day to keep it going"
                tone="banana"
              />
              <StatCard
                icon={<TrophyIcon size={22} />}
                value={`${summary.bestStreak}`}
                label="Best streak"
                hint="Your record so far"
                tone="berry"
              />
            </div>
          </div>

          {/* --------------------------- category progress ------------------- */}
          <section className="mt-10" aria-labelledby="category-progress">
            <h2 id="category-progress" className="text-xl">
              Progress by category
            </h2>
            <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
              {summary.byCategory.map(({ category, completed, total }) => {
                const meta = categoryById(category)
                return (
                  <li key={category} className="card-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.accent}`} aria-hidden="true" />
                        <span className="font-extrabold text-ink-900">{meta.label}</span>
                      </div>
                      <span className="text-sm font-extrabold text-ink-500">
                        {completed}/{total}
                      </span>
                    </div>
                    <ProgressBar
                      className="mt-3"
                      value={completed}
                      max={total}
                      label={`${meta.label} progress`}
                      tone="leaf"
                    />
                  </li>
                )
              })}
            </ul>
          </section>

          {/* -------------------------- recently learned --------------------- */}
          <section className="mt-10" aria-labelledby="recent-phrases">
            <h2 id="recent-phrases" className="text-xl">
              Recently learned phrases
            </h2>
            {summary.recentlyLearned.length === 0 ? (
              <p className="mt-3 text-ink-600">Your learned phrases will appear here.</p>
            ) : (
              <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {summary.recentlyLearned.map(({ lesson }) => (
                  <li key={lesson.id} className="card-surface flex flex-col gap-3 p-4">
                    <div>
                      <p className="m-0 text-lg font-extrabold text-ink-900">{lesson.targetPhrase}</p>
                      <p className="m-0 mt-0.5 text-sm text-ink-600">{lesson.exampleSentence}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SpeakButton text={lesson.targetPhrase} variant="quiet" />
                      <Link
                        to={`/lesson/${lesson.slug}`}
                        className="rounded-full border-2 border-cream-300 bg-white px-3.5 py-2 text-sm font-extrabold text-ink-700 no-underline hover:border-banana-400"
                      >
                        Review
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ------------------------------ lesson log ----------------------- */}
          <section className="mt-10" aria-labelledby="lesson-log">
            <h2 id="lesson-log" className="text-xl">
              Lesson by lesson
            </h2>
            <ul className="mt-4 list-none divide-y divide-cream-300 overflow-hidden rounded-3xl border border-cream-300 bg-white p-0">
              {statuses.map(({ lesson, completed, record, unlocked }) => (
                <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${
                        completed ? 'bg-leaf-500 text-white' : 'bg-cream-200 text-ink-500'
                      }`}
                      aria-hidden="true"
                    >
                      {completed ? <CheckIcon size={18} /> : lesson.order}
                    </span>
                    <div>
                      <p className="m-0 font-extrabold text-ink-900">{lesson.title}</p>
                      <p className="m-0 text-xs font-bold text-ink-400">
                        {categoryById(lesson.category).label} · {lesson.level}
                        {record.attempts > 0 && ` · ${record.attempts} ${record.attempts === 1 ? 'answer' : 'answers'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {completed ? (
                      <Pill tone="leaf">Completed</Pill>
                    ) : unlocked ? (
                      <Link
                        to={`/lesson/${lesson.slug}`}
                        className="rounded-full border-2 border-banana-600 bg-banana-500 px-4 py-2 text-sm font-extrabold text-ink-900 no-underline shadow-pop"
                      >
                        Start
                      </Link>
                    ) : (
                      <Pill>Locked</Pill>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* -------------------------------- reset -------------------------- */}
          <section className="mt-10">
            <div className="card-surface flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="max-w-xl">
                <h2 className="flex items-center gap-2 text-lg">
                  <SparklesIcon size={20} className="text-banana-600" />
                  Start again from zero
                </h2>
                <p className="mt-1 text-sm text-ink-600">
                  This clears every answer, streak and completed lesson stored in this browser. It
                  cannot be undone.
                </p>
              </div>
              {confirming ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      reset()
                      setConfirming(false)
                    }}
                    className="rounded-full border-2 border-berry-600 bg-berry-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-pop"
                  >
                    Yes, reset everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-full border-2 border-cream-300 bg-white px-4 py-2.5 text-sm font-extrabold text-ink-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="rounded-full border-2 border-cream-300 bg-white px-5 py-2.5 text-sm font-extrabold text-ink-600 hover:border-berry-200 hover:text-berry-600"
                >
                  Reset my progress
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
