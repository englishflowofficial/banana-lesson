import { useCallback, useState } from 'react'

export type AnswerPhase = 'answering' | 'correct' | 'incorrect' | 'revealed'

export interface LessonSession {
  /** The option the learner picked (or null before they pick anything). */
  selected: string | null
  phase: AnswerPhase
  /** Number of wrong attempts in this lesson run. */
  wrongAttempts: number
  /** True once the learner has seen the explanation. */
  answered: boolean
  choose: (option: string) => void
  tryAgain: () => void
  reveal: () => void
  restart: () => void
}

/**
 * The answer state machine for one lesson.
 *
 * Keeping this out of the page component means the player stays a thin view over
 * testable logic, and different lesson types can reuse it.
 */
export function useLessonSession(args: {
  lessonId: string
  correctAnswer: string
  onAnswered: (correct: boolean) => void
}): LessonSession {
  const { lessonId, correctAnswer, onAnswered } = args
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<AnswerPhase>('answering')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [answered, setAnswered] = useState(false)

  const choose = useCallback(
    (option: string) => {
      if (phase === 'correct' || phase === 'revealed') return
      setSelected(option)
      const isCorrect = option === correctAnswer
      setPhase(isCorrect ? 'correct' : 'incorrect')
      setAnswered(true)
      if (!isCorrect) setWrongAttempts((n) => n + 1)
      onAnswered(isCorrect)
    },
    [correctAnswer, onAnswered, phase],
  )

  const tryAgain = useCallback(() => {
    setSelected(null)
    setPhase('answering')
  }, [])

  const reveal = useCallback(() => {
    setSelected(null)
    setPhase('revealed')
    setAnswered(true)
  }, [])

  const restart = useCallback(() => {
    setSelected(null)
    setPhase('answering')
    setWrongAttempts(0)
    setAnswered(false)
  }, [])

  // Reset everything when the player moves to another lesson.
  const [lastLessonId, setLastLessonId] = useState(lessonId)
  if (lastLessonId !== lessonId) {
    setLastLessonId(lessonId)
    setSelected(null)
    setPhase('answering')
    setWrongAttempts(0)
    setAnswered(false)
  }

  return { selected, phase, wrongAttempts, answered, choose, tryAgain, reveal, restart }
}
