import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LessonCard } from '../components/LessonCard'
import { ButtonLink, EmptyState, Pill, SectionHeading } from '../components/ui'
import { SearchIcon } from '../components/icons'
import { useProgress } from '../hooks/useProgress'
import { categories } from '../data/categories'
import type { CefrLevel, CategoryId } from '../types/lesson'

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1']
const DIFFICULTIES: Array<{ value: 1 | 2 | 3; label: string }> = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Tricky' },
]

type CompletionFilter = 'all' | 'completed' | 'remaining'

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-extrabold transition-colors ${
        active
          ? 'border-banana-500 bg-banana-100 text-banana-700'
          : 'border-cream-300 bg-white text-ink-600 hover:border-banana-400 hover:text-ink-900'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * Lesson library: search, filter and browse the whole catalogue with completed
 * and locked states visible at a glance.
 */
export default function LibraryPage() {
  const { statuses } = useProgress()
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const category = (params.get('category') as CategoryId | null) ?? null
  const level = (params.get('level') as CefrLevel | null) ?? null
  const difficulty = params.get('difficulty') ? Number(params.get('difficulty')) : null
  const completion = (params.get('state') as CompletionFilter | null) ?? 'all'

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return statuses.filter(({ lesson, completed }) => {
      if (category && lesson.category !== category) return false
      if (level && lesson.level !== level) return false
      if (difficulty && lesson.difficulty !== difficulty) return false
      if (completion === 'completed' && !completed) return false
      if (completion === 'remaining' && completed) return false
      if (!needle) return true
      const haystack = [
        lesson.title,
        lesson.targetPhrase,
        lesson.exampleSentence,
        lesson.level,
        lesson.category,
        ...lesson.tags,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [statuses, query, category, level, difficulty, completion])

  const activeFilters =
    (category ? 1 : 0) + (level ? 1 : 0) + (difficulty ? 1 : 0) + (completion !== 'all' ? 1 : 0)

  // When the learner returns to this page we want the filters they last used.
  const paramsKey = `${category}-${level}-${difficulty}-${completion}-${query}`
  void paramsKey

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Lesson library"
        title="Every action lesson in one place"
        description="Search by phrase, filter by topic or level, and pick up any lesson you have unlocked."
        level={1}
      />

      {/* -------------------------------- filters ----------------------------- */}
      <div className="card-surface mt-6 p-4 sm:p-5">
        <div className="relative">
          <label htmlFor="lesson-search" className="sr-only">
            Search lessons
          </label>
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-400">
            <SearchIcon size={20} />
          </span>
          <input
            id="lesson-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search: banana, water, shoes…"
            className="w-full rounded-2xl border-2 border-cream-300 bg-cream-50 py-3 pr-4 pl-12 text-base font-semibold text-ink-800 placeholder:text-ink-300 focus:border-lagoon-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-1.5 text-xs font-extrabold tracking-wide text-ink-400 uppercase">
              Category
            </legend>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={category === null} onClick={() => updateParam('category', null)}>
                All
              </FilterChip>
              {categories.map((item) => (
                <FilterChip
                  key={item.id}
                  active={category === item.id}
                  onClick={() => updateParam('category', item.id)}
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-1.5 text-xs font-extrabold tracking-wide text-ink-400 uppercase">
              Level
            </legend>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={level === null} onClick={() => updateParam('level', null)}>
                All
              </FilterChip>
              {LEVELS.map((item) => (
                <FilterChip key={item} active={level === item} onClick={() => updateParam('level', item)}>
                  {item}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-1.5 text-xs font-extrabold tracking-wide text-ink-400 uppercase">
              Difficulty
            </legend>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={difficulty === null} onClick={() => updateParam('difficulty', null)}>
                All
              </FilterChip>
              {DIFFICULTIES.map((item) => (
                <FilterChip
                  key={item.value}
                  active={difficulty === item.value}
                  onClick={() => updateParam('difficulty', String(item.value))}
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-1.5 text-xs font-extrabold tracking-wide text-ink-400 uppercase">
              Status
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ['all', 'All'],
                  ['completed', 'Completed'],
                  ['remaining', 'Still to do'],
                ] as Array<[CompletionFilter, string]>
              ).map(([value, label]) => (
                <FilterChip
                  key={value}
                  active={completion === value}
                  onClick={() => updateParam('state', value === 'all' ? null : value)}
                >
                  {label}
                </FilterChip>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* -------------------------------- results ----------------------------- */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm font-bold text-ink-600" role="status" aria-live="polite">
          {results.length} {results.length === 1 ? 'lesson' : 'lessons'} found
        </p>
        <div className="flex items-center gap-2">
          {activeFilters > 0 && <Pill tone="lagoon">{activeFilters} filters active</Pill>}
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setParams(new URLSearchParams(), { replace: true })
                setQuery('')
              }}
              className="rounded-full border-2 border-cream-300 bg-white px-3.5 py-1.5 text-sm font-extrabold text-ink-600 hover:border-berry-200 hover:text-berry-600"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No lessons match those filters"
            description="Try a different search word, or clear the filters to see the whole library again."
            action={
              <button
                type="button"
                onClick={() => {
                  setParams(new URLSearchParams(), { replace: true })
                  setQuery('')
                }}
                className="rounded-full border-2 border-banana-600 bg-banana-500 px-5 py-2.5 text-sm font-extrabold text-ink-900 shadow-pop"
              >
                Show all lessons
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((status) => (
            <li key={status.lesson.id}>
              <LessonCard
                status={status}
                highlight={!status.completed && status.unlocked && status.index === statuses.findIndex((s) => !s.completed)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* how unlocking works */}
      <div className="card-surface mt-10 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="max-w-xl">
          <h2 className="text-lg">How unlocking works</h2>
          <p className="mt-1 text-sm text-ink-600">
            Lessons open in order so the vocabulary grows gradually. Finish a lesson to unlock the
            next one — you can always replay the ones you have already completed.
          </p>
        </div>
        <ButtonLink to="/progress" variant="secondary">
          View your progress
        </ButtonLink>
      </div>
    </div>
  )
}
