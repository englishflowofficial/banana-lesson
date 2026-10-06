import { useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SceneView } from '../animations/SceneView'
import { AnswerCard, type AnswerState } from '../components/AnswerCard'
import { SpeakButton } from '../components/SpeakButton'
import { ArrowLink, ButtonLink, Pill, ProgressBar } from '../components/ui'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  CrossIcon,
  LightbulbIcon,
  ReplayIcon,
  SparklesIcon,
} from '../components/icons'
import { useProgress } from '../hooks/useProgress'
import { useLessonSession } from '../hooks/useLessonSession'
import { useSoundPreference, useSpeech } from '../hooks/useAudio'
import { playCue } from '../lib/audio'
import { categoryById, difficultyLabels } from '../data/categories'
import type { LessonStatus } from '../lib/progress'

/* -------------------------------------------------------------------------- */
/*  The runner                                                                */
/* -------------------------------------------------------------------------- */

function LessonRunner({
  status,
  previous,
  upcoming,
}: {
  status: LessonStatus
  previous: LessonStatus | null
  upcoming: LessonStatus | null
}) {
  const { lesson } = status
  const { answer: recordAnswer, summary } = useProgress()
  const navigate = useNavigate()
  const [soundEnabled] = useSoundPreference()
  const { say } = useSpeech()
  const feedbackRef = useRef<HTMLDivElement>(null)

  const onAnswered = useCallback(
    (correct: boolean) => {
      recordAnswer(lesson.id, correct)
      playCue(correct ? 'correct' : 'incorrect', soundEnabled)
      if (correct && upcoming === null && summary.completedLessons + 1 >= summary.totalLessons) {
        playCue('complete', soundEnabled)
      }
    },
    // summary is intentionally read at call time; re-creating the callback on
    // every progress change would fight the session state machine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson.id, recordAnswer, soundEnabled, upcoming],
  )

  const session = useLessonSession({
    lessonId: lesson.id,
    correctAnswer: lesson.correctAnswer,
    onAnswered,
  })

  // Speak the example sentence as soon as the learner gets it right.
  useEffect(() => {
    if (session.phase === 'correct') {
      const timeout = window.setTimeout(() => say(lesson.exampleSentence), 450)
      return () => window.clearTimeout(timeout)
    }
    if (session.phase === 'revealed') {
      const timeout = window.setTimeout(() => say(lesson.exampleSentence), 500)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [session.phase, lesson.exampleSentence, say])

  // Move focus to the feedback so screen-reader users hear the result.
  useEffect(() => {
    if (session.phase !== 'answering') feedbackRef.current?.focus()
  }, [session.phase])

  // Number keys pick an answer, Enter moves on — a small speed win for repeat visits.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const numeric = Number.parseInt(event.key, 10)
      if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= lesson.answerChoices.length) {
        if (session.phase === 'answering') {
          session.choose(lesson.answerChoices[numeric - 1])
        }
        return
      }
      if (event.key === 'Enter' && session.phase === 'correct' && upcoming) {
        navigate(`/lesson/${upcoming.lesson.slug}`)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [session, lesson.answerChoices, navigate, upcoming])

  const stateFor = (option: string): AnswerState => {
    if (session.phase === 'correct' || session.phase === 'revealed') {
      if (option === lesson.correctAnswer) return session.phase === 'correct' ? 'correct' : 'revealed'
      return 'muted'
    }
    if (session.selected === option) return session.phase === 'incorrect' ? 'wrong' : 'idle'
    if (session.phase === 'incorrect' && session.selected !== null) return 'idle'
    return 'idle'
  }

  const isLocked = session.phase === 'correct' || session.phase === 'revealed'
  const hint = session.selected ? lesson.mistakeHints?.[session.selected] : undefined

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ------------------------------- header ------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/lessons"
          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-600 hover:text-ink-900"
        >
          <ArrowLeftIcon size={18} /> All lessons
        </Link>
        <div className="flex items-center gap-2">
          <Pill tone="lagoon">{lesson.level}</Pill>
          <Pill tone="banana">{categoryById(lesson.category).label}</Pill>
          {status.completed && <Pill tone="leaf">Reviewed</Pill>}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="m-0 text-sm font-extrabold tracking-wide text-ink-400 uppercase">
            Lesson {lesson.order} of {summary.totalLessons}
          </p>
          <p className="m-0 text-sm font-bold text-ink-500">
            {summary.completedLessons} completed · {difficultyLabels[lesson.difficulty]}
          </p>
        </div>
        <ProgressBar
          className="mt-2"
          value={summary.completedLessons}
          max={summary.totalLessons}
          label="Lessons completed"
          tone="leaf"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-8">
        {/* ----------------------------- animation --------------------------- */}
        <div className="lg:sticky lg:top-24">
          <h1 className="text-2xl sm:text-3xl">{lesson.title}</h1>
          <p className="mt-1.5 text-ink-600">
            Watch the action, then choose the phrase that describes it.
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl">
            <SceneView
              key={lesson.id}
              animation={lesson.animationType}
              altText={lesson.altText}
              caption={session.phase === 'answering' ? undefined : lesson.caption}
            />
          </div>
        </div>

        {/* ------------------------------ question --------------------------- */}
        <div>
          <div className="card-surface p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl">{lesson.question}</h2>
            <p className="mt-1 text-sm font-semibold text-ink-500">
              Tip: press 1–4 on your keyboard to answer quickly.
            </p>

            <div
              className="mt-5 grid gap-3"
              role="group"
              aria-label={`Answer options for lesson ${lesson.order}: ${lesson.title}`}
            >
              {lesson.answerChoices.map((option, index) => (
                <AnswerCard
                  key={option}
                  index={index}
                  label={option}
                  state={stateFor(option)}
                  disabled={isLocked}
                  onSelect={() => session.choose(option)}
                />
              ))}
            </div>
          </div>

          {/* ------------------------------ feedback -------------------------- */}
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className="mt-4 focus:outline-none"
            role="status"
            aria-live={session.phase === 'incorrect' ? 'assertive' : 'polite'}
          >
            {session.phase === 'correct' && (
              <div className="animate-pop-in rounded-3xl border-2 border-leaf-200 bg-leaf-50 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf-500 text-white">
                    <CheckIcon size={24} />
                  </span>
                  <div>
                    <p className="m-0 text-lg font-extrabold text-leaf-900">That&rsquo;s right!</p>
                    <p className="m-0 text-sm font-bold text-leaf-700">
                      {lesson.correctAnswer} · lesson complete
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-ink-700">{lesson.explanation}</p>

                <div className="mt-4 rounded-2xl border border-leaf-200 bg-white/85 p-4">
                  <p className="m-0 text-xs font-extrabold tracking-wide text-ink-400 uppercase">
                    Example sentence
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-ink-900">{lesson.exampleSentence}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <SpeakButton text={lesson.audioText} label={`Hear the phrase: ${lesson.targetPhrase}`} />
                  {upcoming ? (
                    <ButtonLink to={`/lesson/${upcoming.lesson.slug}`}>
                      Next lesson: {upcoming.lesson.title}
                      <ChevronRightIcon size={18} />
                    </ButtonLink>
                  ) : (
                    <ButtonLink to="/progress">
                      See your progress
                      <ChevronRightIcon size={18} />
                    </ButtonLink>
                  )}
                </div>
              </div>
            )}

            {session.phase === 'incorrect' && (
              <div className="animate-pop-in rounded-3xl border-2 border-berry-200 bg-berry-50 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-berry-500 text-white">
                    <CrossIcon size={24} />
                  </span>
                  <div>
                    <p className="m-0 text-lg font-extrabold text-berry-700">Not quite — try again</p>
                    <p className="m-0 text-sm font-bold text-berry-600">
                      &ldquo;{session.selected}&rdquo; is not the action in the animation
                    </p>
                  </div>
                </div>

                {hint && (
                  <p className="mt-4 flex gap-2.5 text-ink-700">
                    <LightbulbIcon size={20} className="mt-0.5 shrink-0 text-banana-600" />
                    <span>{hint}</span>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={session.tryAgain}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-berry-500 bg-white px-5 py-2.5 text-sm font-extrabold text-berry-700 shadow-pop transition-colors hover:bg-berry-100 active:translate-y-px"
                  >
                    <ReplayIcon size={18} /> Try another answer
                  </button>
                  <button
                    type="button"
                    onClick={session.reveal}
                    className="rounded-full border-2 border-transparent px-3 py-2.5 text-sm font-extrabold text-ink-600 underline decoration-2 underline-offset-4 hover:text-ink-900"
                  >
                    Show me the answer
                  </button>
                </div>

                {session.wrongAttempts >= 2 && (
                  <p className="mt-3 text-sm font-semibold text-ink-500">
                    Stuck? Watch the animation once more — the hands pull the yellow skin away.
                  </p>
                )}
              </div>
            )}

            {session.phase === 'revealed' && (
              <div className="animate-fade-up rounded-3xl border-2 border-banana-300 bg-banana-50 p-5 sm:p-6">
                <p className="m-0 text-sm font-extrabold tracking-wide text-banana-700 uppercase">
                  The answer is
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink-900">{lesson.correctAnswer}</p>
                <p className="mt-3 text-ink-700">{lesson.explanation}</p>

                <div className="mt-4 rounded-2xl border border-banana-200 bg-white/85 p-4">
                  <p className="m-0 text-xs font-extrabold tracking-wide text-ink-400 uppercase">
                    Example sentence
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-ink-900">{lesson.exampleSentence}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <SpeakButton text={lesson.audioText} />
                  <button
                    type="button"
                    onClick={session.restart}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-cream-300 bg-white px-5 py-2.5 text-sm font-extrabold text-ink-700 shadow-pop hover:border-banana-400"
                  >
                    <ReplayIcon size={18} /> Try this lesson again
                  </button>
                  {upcoming && (
                    <ButtonLink to={`/lesson/${upcoming.lesson.slug}`} variant="secondary">
                      Next lesson
                      <ChevronRightIcon size={18} />
                    </ButtonLink>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------ helper ---------------------------- */}
          {session.phase === 'answering' && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-cream-300 bg-white/70 px-4 py-3">
              <SparklesIcon size={18} className="text-banana-600" />
              <p className="m-0 text-sm font-semibold text-ink-600">
                Say the phrase out loud while the animation plays — it helps it stick.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------- lesson navigation ----------------------- */}
      <nav
        aria-label="Lesson navigation"
        className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-cream-300 pt-6"
      >
        {previous ? (
          <Link
            to={`/lesson/${previous.lesson.slug}`}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-cream-300 bg-white px-4 py-3 text-sm font-extrabold text-ink-700 no-underline shadow-pop hover:border-banana-400"
          >
            <ArrowLeftIcon size={18} />
            <span>
              <span className="block text-xs font-bold text-ink-400">Previous</span>
              {previous.lesson.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          <ArrowLink to="/lessons">Lesson library</ArrowLink>
          {upcoming ? (
            <Link
              to={`/lesson/${upcoming.lesson.slug}`}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-cream-300 bg-white px-4 py-3 text-right text-sm font-extrabold text-ink-700 no-underline shadow-pop hover:border-banana-400"
            >
              <span>
                <span className="block text-xs font-bold text-ink-400">Next</span>
                {upcoming.lesson.title}
              </span>
              <ArrowRightIcon size={18} />
            </Link>
          ) : (
            <ButtonLink to="/progress" variant="secondary">
              Finish · see progress
            </ButtonLink>
          )}
        </div>
      </nav>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Routing + gating                                                          */
/* -------------------------------------------------------------------------- */

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const { statuses } = useProgress()
  const index = statuses.findIndex((s) => s.lesson.slug === slug)
  const status = index >= 0 ? statuses[index] : undefined

  if (!status) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl">We could not find that lesson</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-600">
          The link may be out of date. Every lesson is available from the library.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink to="/lessons">Open the lesson library</ButtonLink>
        </div>
      </div>
    )
  }

  const previous = index > 0 ? statuses[index - 1] : null
  const upcoming = index < statuses.length - 1 ? statuses[index + 1] : null

  if (!status.unlocked && !status.completed) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <Pill tone="banana" className="mb-3">
          Lesson {status.lesson.order}
        </Pill>
        <h1 className="text-3xl">{status.lesson.title} is still locked</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-600">
          Lessons open one at a time so the new words build on each other. Finish the lesson before
          this one and it will unlock straight away.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {previous && (
            <ButtonLink to={`/lesson/${previous.lesson.slug}`}>
              Go to {previous.lesson.title}
            </ButtonLink>
          )}
          <ButtonLink to="/lessons" variant="secondary">
            Lesson library
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <LessonRunner
      key={status.lesson.id}
      status={status}
      previous={previous}
      upcoming={upcoming}
    />
  )
}
