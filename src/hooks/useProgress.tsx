/* eslint-disable react-refresh/only-export-components -- the progress provider and its hook are intentionally one module. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { lessons } from '../data/lessons'
import {
  emptyProgress,
  loadProgress,
  lessonStatuses,
  nextLesson,
  recordAnswer,
  resetProgress,
  saveProgress,
  summarize,
  type LessonStatus,
  type ProgressState,
  type ProgressSummary,
} from '../lib/progress'

interface ProgressContextValue {
  state: ProgressState
  statuses: LessonStatus[]
  summary: ProgressSummary
  /** The lesson the learner should do next. */
  next: LessonStatus
  /** Record an answer; also updates streaks and totals. */
  answer: (lessonId: string, correct: boolean) => void
  /** Wipe everything (with a confirm handled by the caller). */
  reset: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() =>
    typeof window === 'undefined' ? emptyProgress : loadProgress(),
  )
  const firstRender = useRef(true)

  useEffect(() => {
    // Skip the very first save: it would rewrite identical data on mount.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    saveProgress(state)
  }, [state])

  // Keep two tabs of the app in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith('actionEnglish:progress')) {
        setState(loadProgress())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const answer = useCallback((lessonId: string, correct: boolean) => {
    setState((current) => recordAnswer(current, { lessonId, correct }))
  }, [])

  const reset = useCallback(() => setState(resetProgress()), [])

  const value = useMemo<ProgressContextValue>(() => {
    const statuses = lessonStatuses(state, lessons)
    return {
      state,
      statuses,
      summary: summarize(state, lessons),
      next: nextLesson(statuses),
      answer,
      reset,
    }
  }, [state, answer, reset])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used inside a <ProgressProvider>')
  }
  return context
}
