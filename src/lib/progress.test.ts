import { describe, expect, it, beforeEach } from 'vitest'
import {
  PROGRESS_KEY,
  dayKey,
  emptyProgress,
  lessonStatuses,
  liveStreak,
  loadProgress,
  nextLesson,
  recordAnswer,
  resetProgress,
  saveProgress,
  summarize,
  type ProgressState,
} from './progress'
import { lessons } from '../data/lessons'

const lessonA = lessons[0]
const lessonB = lessons[1]

describe('recordAnswer', () => {
  it('marks a lesson complete only when the answer is correct', () => {
    const wrong = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: false })
    expect(wrong.lessons[lessonA.id].completed).toBe(false)
    expect(wrong.lessons[lessonA.id].attempts).toBe(1)
    expect(wrong.totals).toEqual({ answered: 1, correct: 0 })

    const right = recordAnswer(wrong, { lessonId: lessonA.id, correct: true })
    expect(right.lessons[lessonA.id].completed).toBe(true)
    expect(right.lessons[lessonA.id].attempts).toBe(2)
    expect(right.lessons[lessonA.id].correct).toBe(1)
    expect(right.totals).toEqual({ answered: 2, correct: 1 })
  })

  it('does not mutate the state it is given', () => {
    const before = JSON.stringify(emptyProgress)
    recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true })
    expect(JSON.stringify(emptyProgress)).toBe(before)
  })

  it('keeps the first completion time when a lesson is replayed', () => {
    const first = recordAnswer(emptyProgress, {
      lessonId: lessonA.id,
      correct: true,
      now: new Date('2026-03-01T09:00:00'),
    })
    const replay = recordAnswer(first, {
      lessonId: lessonA.id,
      correct: true,
      now: new Date('2026-03-05T09:00:00'),
    })
    expect(replay.lessons[lessonA.id].completedAt).toBe(first.lessons[lessonA.id].completedAt)
  })
})

describe('streaks', () => {
  const day1 = new Date('2026-03-01T10:00:00')
  const day2 = new Date('2026-03-02T10:00:00')
  const day4 = new Date('2026-03-04T10:00:00')

  it('starts at one and grows on consecutive days', () => {
    const s1 = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true, now: day1 })
    expect(s1.streak.count).toBe(1)

    const s2 = recordAnswer(s1, { lessonId: lessonB.id, correct: true, now: day2 })
    expect(s2.streak.count).toBe(2)
    expect(s2.streak.best).toBe(2)
  })

  it('restarts after a missed day', () => {
    const s1 = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true, now: day1 })
    const s2 = recordAnswer(s1, { lessonId: lessonB.id, correct: true, now: day2 })
    const s4 = recordAnswer(s2, { lessonId: lessons[2].id, correct: true, now: day4 })
    expect(s4.streak.count).toBe(1)
    expect(s4.streak.best).toBe(2)
  })

  it('only counts the first completion of a lesson towards the streak', () => {
    const s1 = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true, now: day1 })
    const again = recordAnswer(s1, { lessonId: lessonA.id, correct: true, now: day1 })
    expect(again.streak.count).toBe(1)
  })

  it('reports a live streak that survives one quiet day', () => {
    const state: ProgressState = {
      ...emptyProgress,
      streak: { count: 4, best: 6, lastCompletedDay: '2026-03-02' },
    }
    expect(liveStreak(state, new Date('2026-03-03T08:00:00'))).toBe(4)
    expect(liveStreak(state, new Date('2026-03-05T08:00:00'))).toBe(0)
  })
})

describe('lessonStatuses', () => {
  it('unlocks the first lesson and locks the rest', () => {
    const statuses = lessonStatuses(emptyProgress, lessons)
    expect(statuses[0].unlocked).toBe(true)
    expect(statuses[1].unlocked).toBe(false)
    expect(statuses[1].completed).toBe(false)
  })

  it('unlocks the next lesson once the previous one is completed', () => {
    const state = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true })
    const statuses = lessonStatuses(state, lessons)
    expect(statuses[0].completed).toBe(true)
    expect(statuses[1].unlocked).toBe(true)
    expect(statuses[2].unlocked).toBe(false)
  })

  it('points at the next unfinished lesson', () => {
    const state = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true })
    const status = nextLesson(lessonStatuses(state, lessons))
    expect(status.lesson.id).toBe(lessonB.id)
  })

  it('falls back to the first lesson when everything is complete', () => {
    let state = emptyProgress
    for (const lesson of lessons) state = recordAnswer(state, { lessonId: lesson.id, correct: true })
    const status = nextLesson(lessonStatuses(state, lessons))
    expect(status.lesson.id).toBe(lessons[0].id)
  })
})

describe('summarize', () => {
  it('computes completion, accuracy and category totals', () => {
    let state = emptyProgress
    state = recordAnswer(state, { lessonId: lessons[0].id, correct: false })
    state = recordAnswer(state, { lessonId: lessons[0].id, correct: true })
    const summary = summarize(state, lessons, new Date())

    expect(summary.completedLessons).toBe(1)
    expect(summary.totalLessons).toBe(lessons.length)
    expect(summary.answered).toBe(2)
    expect(summary.correct).toBe(1)
    expect(summary.accuracy).toBeCloseTo(0.5)
    expect(summary.recentlyLearned[0].lesson.id).toBe(lessons[0].id)
    expect(summary.byCategory.every((entry) => entry.total > 0)).toBe(true)
  })

  it('reports zero accuracy before any answer', () => {
    const summary = summarize(emptyProgress, lessons)
    expect(summary.accuracy).toBe(0)
    expect(summary.completionRatio).toBe(0)
    expect(summary.recentlyLearned).toEqual([])
  })
})

describe('persistence', () => {
  beforeEach(() => window.localStorage.clear())

  it('round-trips through localStorage', () => {
    const state = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true })
    saveProgress(state)
    expect(loadProgress()).toEqual(state)
  })

  it('ignores corrupted data', () => {
    window.localStorage.setItem(PROGRESS_KEY, 'not json at all')
    expect(loadProgress()).toEqual(emptyProgress)
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 99 }))
    expect(loadProgress()).toEqual(emptyProgress)
  })

  it('resets everything', () => {
    const state = recordAnswer(emptyProgress, { lessonId: lessonA.id, correct: true })
    expect(resetProgress()).toEqual(emptyProgress)
    expect(state.lessons[lessonA.id].completed).toBe(true)
  })
})

describe('dayKey', () => {
  it('uses local calendar days', () => {
    expect(dayKey(new Date('2026-01-05T23:30:00'))).toBe('2026-01-05')
  })
})
