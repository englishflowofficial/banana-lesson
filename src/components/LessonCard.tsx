import { Link } from 'react-router-dom'
import type { LessonStatus } from '../lib/progress'
import { categoryById, difficultyLabels } from '../data/categories'
import { CheckIcon, LockIcon, PlayIcon } from './icons'
import { Pill } from './ui'

interface Props {
  status: LessonStatus
  /** Show a small "next up" flag on the lesson the learner should do next. */
  highlight?: boolean
  /** Extra markup under the card body (used by the library filters summary). */
  footer?: React.ReactNode
}

export function LessonCard({ status, highlight = false, footer }: Props) {
  const { lesson, completed, unlocked, record } = status
  const category = categoryById(lesson.category)

  const card = (
    <article
      className={`card-surface flex h-full flex-col overflow-hidden transition-transform duration-200 ${
        unlocked ? 'hover:-translate-y-0.5' : ''
      } ${highlight ? 'ring-2 ring-banana-400' : ''}`}
    >
      <div className={`relative h-2 ${completed ? 'bg-leaf-500' : category.accent}`} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-extrabold tracking-widest text-ink-400 uppercase">
              Lesson {lesson.order}
            </p>
            <h3 className="mt-1 text-lg leading-snug">{lesson.title}</h3>
          </div>
          {completed ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-leaf-100 px-2.5 py-1 text-xs font-extrabold text-leaf-700">
              <CheckIcon size={14} /> Done
            </span>
          ) : unlocked ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-banana-100 px-2.5 py-1 text-xs font-extrabold text-banana-700">
              Ready
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1 text-xs font-extrabold text-ink-500">
              <LockIcon size={14} /> Locked
            </span>
          )}
        </div>

        <p className="m-0 text-sm text-ink-600">{lesson.exampleSentence}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          <Pill tone="lagoon">{lesson.level}</Pill>
          <Pill>{difficultyLabels[lesson.difficulty]}</Pill>
          <Pill tone="banana">{category.label}</Pill>
        </div>

        {record.attempts > 0 && !completed && (
          <p className="m-0 text-xs font-bold text-ink-400">
            {record.attempts} {record.attempts === 1 ? 'try' : 'tries'} so far — you can do it!
          </p>
        )}

        {footer}
      </div>

      <div className="border-t border-cream-300 bg-cream-50 px-5 py-3">
        {unlocked ? (
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-lagoon-600">
            {completed ? 'Practise again' : 'Start lesson'}
            <PlayIcon size={16} />
          </span>
        ) : (
          <span className="text-sm font-bold text-ink-400">
            Finish lesson {lesson.order - 1} to unlock
          </span>
        )}
      </div>
    </article>
  )

  if (!unlocked) {
    return (
      <div aria-disabled="true" title="Finish the previous lesson to unlock this one">
        {card}
      </div>
    )
  }

  return (
    <Link
      to={`/lesson/${lesson.slug}`}
      className="block h-full rounded-3xl no-underline focus-visible:outline-offset-4"
      aria-label={`Lesson ${lesson.order}: ${lesson.title}. Level ${lesson.level}. ${completed ? 'Completed.' : 'Not completed yet.'}`}
    >
      {card}
    </Link>
  )
}
