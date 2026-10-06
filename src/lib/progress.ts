import type { Lesson } from '../types/lesson'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface LessonRecord {
  /** How many times an answer was given for this lesson. */
  attempts: number
  /** How many of those answers were correct. */
  correct: number
  /** True once the learner has answered correctly at least once. */
  completed: boolean
  /** Result of the most recent answer, or null if never answered. */
  lastCorrect: boolean | null
  lastAttemptAt: number | null
  completedAt: number | null
}

export interface StreakRecord {
  /** Consecutive days with at least one newly completed lesson. */
  count: number
  /** Best streak ever reached. */
  best: number
  /** Local day key (YYYY-MM-DD) of the last completed lesson. */
  lastCompletedDay: string | null
}

export interface ProgressState {
  version: number
  lessons: Record<string, LessonRecord>
  streak: StreakRecord
  totals: { answered: number; correct: number }
}

export const PROGRESS_VERSION = 1
export const PROGRESS_KEY = 'actionEnglish:progress:v1'

export const emptyProgress: ProgressState = {
  version: PROGRESS_VERSION,
  lessons: {},
  streak: { count: 0, best: 0, lastCompletedDay: null },
  totals: { answered: 0, correct: 0 },
}

const emptyLessonRecord: LessonRecord = {
  attempts: 0,
  correct: 0,
  completed: false,
  lastCorrect: null,
  lastAttemptAt: null,
  completedAt: null,
}

/* -------------------------------------------------------------------------- */
/*  Day helpers (local time, so streaks follow the learner's day)              */
/* -------------------------------------------------------------------------- */

export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dayBefore(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  date.setDate(date.getDate() - 1)
  return dayKey(date)
}

/** Streak as the learner sees it right now (it survives until a full day is missed). */
export function liveStreak(state: ProgressState, now: Date = new Date()): number {
  const last = state.streak.lastCompletedDay
  if (!last) return 0
  const today = dayKey(now)
  if (last === today || last === dayBefore(today)) return state.streak.count
  return 0
}

/* -------------------------------------------------------------------------- */
/*  Reducers (pure, so they are easy to test)                                  */
/* -------------------------------------------------------------------------- */

export interface AnswerInput {
  lessonId: string
  correct: boolean
  now?: Date
}

export function recordAnswer(state: ProgressState, input: AnswerInput): ProgressState {
  const now = input.now ?? new Date()
  const timestamp = now.getTime()
  const previous = state.lessons[input.lessonId] ?? emptyLessonRecord
  const alreadyCompleted = previous.completed

  const record: LessonRecord = {
    attempts: previous.attempts + 1,
    correct: previous.correct + (input.correct ? 1 : 0),
    completed: previous.completed || input.correct,
    lastCorrect: input.correct,
    lastAttemptAt: timestamp,
    completedAt: previous.completedAt ?? (input.correct ? timestamp : null),
  }

  let streak = state.streak
  if (input.correct && !alreadyCompleted) {
    const today = dayKey(now)
    const count =
      streak.lastCompletedDay === today
        ? Math.max(1, streak.count)
        : streak.lastCompletedDay === dayBefore(today)
          ? streak.count + 1
          : 1
    streak = {
      count,
      best: Math.max(streak.best, count),
      lastCompletedDay: today,
    }
  }

  return {
    version: PROGRESS_VERSION,
    lessons: { ...state.lessons, [input.lessonId]: record },
    streak,
    totals: {
      answered: state.totals.answered + 1,
      correct: state.totals.correct + (input.correct ? 1 : 0),
    },
  }
}

export function resetProgress(): ProgressState {
  return { ...emptyProgress, lessons: {} }
}

/* -------------------------------------------------------------------------- */
/*  Selectors                                                                  */
/* -------------------------------------------------------------------------- */

export interface LessonStatus {
  lesson: Lesson
  record: LessonRecord
  completed: boolean
  /** True when the learner may open it (previous lesson completed). */
  unlocked: boolean
  /** Index in the learning path, 0-based. */
  index: number
}

export function lessonStatuses(state: ProgressState, lessons: Lesson[]): LessonStatus[] {
  let previousCompleted = true
  return lessons.map((lesson, index) => {
    const record = state.lessons[lesson.id] ?? emptyLessonRecord
    const status: LessonStatus = {
      lesson,
      record,
      completed: record.completed,
      unlocked: previousCompleted || record.completed,
      index,
    }
    previousCompleted = record.completed
    return status
  })
}

export interface ProgressSummary {
  completedLessons: number
  totalLessons: number
  completionRatio: number
  answered: number
  correct: number
  accuracy: number
  streak: number
  bestStreak: number
  recentlyLearned: Array<{ lesson: Lesson; at: number }>
  byCategory: Array<{ category: Lesson['category']; completed: number; total: number }>
}

export function summarize(
  state: ProgressState,
  lessons: Lesson[],
  now: Date = new Date(),
): ProgressSummary {
  const completed = lessons.filter((l) => state.lessons[l.id]?.completed)
  const answered = state.totals.answered
  const correct = state.totals.correct

  const recentlyLearned = completed
    .map((lesson) => ({ lesson, at: state.lessons[lesson.id]?.completedAt ?? 0 }))
    .sort((a, b) => b.at - a.at)
    .slice(0, 5)

  const categoryIds = Array.from(new Set(lessons.map((l) => l.category)))
  const byCategory = categoryIds.map((category) => {
    const inCategory = lessons.filter((l) => l.category === category)
    return {
      category,
      total: inCategory.length,
      completed: inCategory.filter((l) => state.lessons[l.id]?.completed).length,
    }
  })

  return {
    completedLessons: completed.length,
    totalLessons: lessons.length,
    completionRatio: lessons.length === 0 ? 0 : completed.length / lessons.length,
    answered,
    correct,
    accuracy: answered === 0 ? 0 : correct / answered,
    streak: liveStreak(state, now),
    bestStreak: state.streak.best,
    recentlyLearned,
    byCategory,
  }
}

/** First lesson the learner has not finished yet — the "continue" target. */
export function nextLesson(statuses: LessonStatus[]): LessonStatus {
  return statuses.find((s) => !s.completed) ?? statuses[0]
}

/* -------------------------------------------------------------------------- */
/*  Persistence                                                                */
/* -------------------------------------------------------------------------- */

function isProgressState(value: unknown): value is ProgressState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<ProgressState>
  return (
    candidate.version === PROGRESS_VERSION &&
    typeof candidate.lessons === 'object' &&
    candidate.lessons !== null &&
    typeof candidate.totals === 'object' &&
    candidate.totals !== null &&
    typeof candidate.streak === 'object' &&
    candidate.streak !== null
  )
}

export function loadProgress(storage: Storage | undefined = safeStorage()): ProgressState {
  if (!storage) return emptyProgress
  try {
    const raw = storage.getItem(PROGRESS_KEY)
    if (!raw) return emptyProgress
    const parsed: unknown = JSON.parse(raw)
    if (!isProgressState(parsed)) return emptyProgress
    return parsed
  } catch {
    return emptyProgress
  }
}

export function saveProgress(
  state: ProgressState,
  storage: Storage | undefined = safeStorage(),
): void {
  if (!storage) return
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(state))
  } catch {
    /* Storage can be blocked or full — progress simply stays in memory. */
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
