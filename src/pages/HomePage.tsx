import { Link } from 'react-router-dom'
import { SceneView } from '../animations/SceneView'
import { LessonCard } from '../components/LessonCard'
import { ArrowLink, Pill, ProgressBar, ProgressRing, SectionHeading, StatCard, ButtonLink } from '../components/ui'
import {
  BookIcon,
  ChartIcon,
  CheckIcon,
  FlameIcon,
  LightbulbIcon,
  PlayIcon,
  SparklesIcon,
  SpeakerIcon,
} from '../components/icons'
import { useProgress } from '../hooks/useProgress'
import { categoryById, categories } from '../data/categories'

const STEPS = [
  {
    icon: PlayIcon,
    title: '1. Watch the action',
    body: 'A short animation shows one everyday action — like hands peeling a banana. Replay it as often as you like.',
  },
  {
    icon: LightbulbIcon,
    title: '2. Choose the phrase',
    body: 'Pick the correct English phrase from four options. Wrong answers are explained, never just marked.',
  },
  {
    icon: SpeakerIcon,
    title: '3. Hear it and use it',
    body: 'Listen to the pronunciation, read a real example sentence, then move on to the next lesson.',
  },
]

export default function HomePage() {
  const { summary, next, statuses } = useProgress()
  const started = summary.answered > 0
  const upcoming = statuses.filter((s) => !s.completed).slice(0, 3)
  const flagship = statuses[0]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* ---------------------------------- hero ------------------------------ */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          <Pill tone="banana" className="mb-4">
            <SparklesIcon size={14} /> Free · no account needed
          </Pill>
          <h1 className="text-4xl leading-[1.05] sm:text-5xl">
            Learn English verbs by watching everyday actions
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-600">
            See a short animation, choose the right English phrase and hear it pronounced. Each
            lesson takes about a minute, and your progress is saved on your own device.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink to={`/lesson/${next.lesson.slug}`} size="lg">
              <PlayIcon size={20} />
              {started ? 'Continue learning' : 'Start learning'}
            </ButtonLink>
            <ButtonLink to="/lessons" variant="secondary" size="lg">
              <BookIcon size={20} />
              Browse all lessons
            </ButtonLink>
          </div>

          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4">
            {[
              { label: 'Lessons', value: `${summary.totalLessons}`, icon: <BookIcon size={18} /> },
              { label: 'Completed', value: `${summary.completedLessons}`, icon: <CheckIcon size={18} /> },
              { label: 'Streak', value: `${summary.streak}`, icon: <FlameIcon size={18} /> },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-cream-300 bg-white/70 px-3 py-2.5">
                <dt className="flex min-h-8 items-start gap-1.5 text-xs leading-tight font-extrabold tracking-wide text-ink-400 uppercase">
                  <span className="text-banana-600">{item.icon}</span>
                  {item.label}
                </dt>
                <dd className="m-0 mt-1 text-2xl leading-none font-extrabold text-ink-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-banana-200/40" aria-hidden="true" />
          <SceneView
            animation={flagship.lesson.animationType}
            altText={flagship.lesson.altText}
            caption={flagship.lesson.caption}
            showStepControls={false}
            compact
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-sm font-bold text-ink-500">
              Lesson 1 · {flagship.lesson.title}
            </p>
            <ArrowLink to={`/lesson/${flagship.lesson.slug}`}>Try this lesson</ArrowLink>
          </div>
        </div>
      </section>

      {/* ------------------------------ how it works -------------------------- */}
      <section className="mt-16 sm:mt-20" aria-labelledby="how-heading">
        <SectionHeading
          eyebrow="How it works"
          title="One action, three quick steps"
          description="No long grammar explanations and nothing to install — just watch, choose and listen."
        />
        <h2 id="how-heading" className="sr-only">
          How it works
        </h2>
        <ol className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card-surface p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-banana-100 text-banana-700">
                <Icon size={22} />
              </span>
              <h3 className="mt-3 text-lg">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------- continue ---------------------------- */}
      <section className="mt-16 sm:mt-20" aria-labelledby="next-heading">
        <SectionHeading
          eyebrow={started ? 'Your progress' : 'Start here'}
          title={started ? 'Continue where you left off' : 'Your first lesson'}
          description={
            started
              ? 'Lessons unlock one at a time, so you always know what to practise next.'
              : 'The banana lesson is the best place to begin — the animation is the clearest of them all.'
          }
          action={<ArrowLink to="/lessons">See every lesson</ArrowLink>}
        />
        <h2 id="next-heading" className="sr-only">
          Up next
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((status, index) => (
            <LessonCard key={status.lesson.id} status={status} highlight={index === 0} />
          ))}
        </div>
      </section>

      {/* ------------------------------- categories --------------------------- */}
      <section className="mt-16 sm:mt-20" aria-labelledby="categories-heading">
        <SectionHeading
          eyebrow="Categories"
          title="Practise by topic"
          description="Every lesson belongs to a topic, so you can focus on the situations you meet every day."
        />
        <h2 id="categories-heading" className="sr-only">
          Categories
        </h2>
        <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const stats = summary.byCategory.find((c) => c.category === category.id)
            return (
              <li key={category.id}>
                <Link
                  to={`/lessons?category=${category.id}`}
                  className="card-surface flex h-full flex-col gap-2 p-5 no-underline transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span className={`h-2 w-12 rounded-full ${category.accent}`} />
                  <h3 className="text-lg text-ink-900">{category.label}</h3>
                  <p className="m-0 text-sm text-ink-600">{category.description}</p>
                  <p className="m-0 mt-auto text-xs font-extrabold text-ink-400">
                    {stats ? `${stats.completed} of ${stats.total} completed` : 'Coming soon'}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ------------------------------- progress ----------------------------- */}
      {started && (
        <section className="mt-16 sm:mt-20" aria-labelledby="summary-heading">
          <SectionHeading
            eyebrow="At a glance"
            title="Your learning so far"
            action={<ArrowLink to="/progress">Full progress page</ArrowLink>}
          />
          <h2 id="summary-heading" className="sr-only">
            Summary
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="card-surface flex items-center justify-center p-6">
              <ProgressRing
                ratio={summary.completionRatio}
                label={`${Math.round(summary.completionRatio * 100)}%`}
                sublabel="of the library"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={<CheckIcon size={22} />}
                value={`${summary.completedLessons}/${summary.totalLessons}`}
                label="Lessons completed"
                tone="leaf"
              />
              <StatCard
                icon={<ChartIcon size={22} />}
                value={`${Math.round(summary.accuracy * 100)}%`}
                label="Answer accuracy"
                hint={`${summary.correct} of ${summary.answered} answers`}
                tone="lagoon"
              />
              <StatCard
                icon={<FlameIcon size={22} />}
                value={`${summary.streak} ${summary.streak === 1 ? 'day' : 'days'}`}
                label="Current streak"
                hint={`Best streak: ${summary.bestStreak}`}
                tone="banana"
              />
              <div className="card-surface p-4">
                <p className="m-0 text-sm font-bold text-ink-600">Library progress</p>
                <ProgressBar
                  className="mt-3"
                  value={summary.completedLessons}
                  max={summary.totalLessons}
                  label="Lessons completed"
                  tone="leaf"
                />
                <p className="m-0 mt-2 text-xs font-semibold text-ink-400">
                  {summary.totalLessons - summary.completedLessons} lessons still to explore
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------- recently learned ----------------------- */}
      {summary.recentlyLearned.length > 0 && (
        <section className="mt-16 sm:mt-20" aria-labelledby="recent-heading">
          <SectionHeading eyebrow="Recently learned" title="Phrases you have practised" />
          <h2 id="recent-heading" className="sr-only">
            Recently learned
          </h2>
          <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {summary.recentlyLearned.map(({ lesson }) => (
              <li key={lesson.id} className="card-surface flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="m-0 text-base font-extrabold text-ink-900">{lesson.targetPhrase}</p>
                  <p className="m-0 mt-0.5 text-xs font-bold text-ink-400">
                    {categoryById(lesson.category).label} · {lesson.level}
                  </p>
                </div>
                <Link
                  to={`/lesson/${lesson.slug}`}
                  className="rounded-full border-2 border-cream-300 px-3 py-1.5 text-xs font-extrabold text-ink-600 no-underline hover:border-banana-400 hover:text-ink-900"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
