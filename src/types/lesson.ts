import type { AnimationKey } from '../animations/scenes'

/** CEFR levels the first release targets. */
export type CefrLevel = 'A1' | 'A2' | 'B1'

export type Difficulty = 1 | 2 | 3

export type CategoryId = 'food' | 'home' | 'self-care' | 'nature'

export interface Category {
  id: CategoryId
  label: string
  description: string
  /** Tailwind colour tokens used for chips, rings and accents. */
  accent: string
  accentSoft: string
  accentText: string
}

/**
 * The single source of truth for a lesson.
 *
 * Content lives in `src/data/lessons/*` and is completely separate from the
 * presentation components, so adding a lesson never means touching the UI — and
 * the whole library can later be served from a CMS or an API without changing
 * the lesson player.
 */
export interface Lesson {
  /** Stable identifier, never reused. */
  id: string
  /** URL-safe identifier used by the router. */
  slug: string
  /** Card + player title, e.g. "Peeling a banana". */
  title: string
  /** The phrase the learner is learning, in the "-ing" form. */
  targetPhrase: string
  /** The prompt shown above the options. */
  question: string
  /** Exactly four options, one of which is `correctAnswer`. */
  answerChoices: string[]
  /** Must be one of `answerChoices`. */
  correctAnswer: string
  /** A natural sentence using the phrase, shown after answering. */
  exampleSentence: string
  /** Why the correct answer is right. */
  explanation: string
  /** Optional extra hint for a specific wrong option. */
  mistakeHints?: Record<string, string>
  /** Which animation component renders this action. */
  animationType: AnimationKey
  /** Text spoken by the browser's speech synthesis. */
  audioText: string
  /** Full description of the action for screen readers. */
  altText: string
  /** Short visual description, shown as a caption under the animation. */
  caption: string
  level: CefrLevel
  category: CategoryId
  difficulty: Difficulty
  /** Free-form tags for search and future grouping. */
  tags: string[]
  /** Position in the learning path (1-based). */
  order: number
}

export interface LessonValidationIssue {
  lessonId: string
  message: string
}

/**
 * Guards the content contract. Called by the lesson repository at import time in
 * development and by the test suite, so a malformed lesson can never ship.
 */
export function validateLesson(lesson: Lesson): LessonValidationIssue[] {
  const issues: LessonValidationIssue[] = []
  const add = (message: string) => issues.push({ lessonId: lesson.id, message })

  if (!lesson.id.trim()) add('id is empty')
  if (!/^[a-z0-9-]+$/.test(lesson.slug)) add(`slug "${lesson.slug}" must be lowercase kebab-case`)
  if (!lesson.targetPhrase.trim()) add('targetPhrase is empty')
  if (!lesson.question.trim()) add('question is empty')
  if (lesson.answerChoices.length !== 4) add(`expected 4 answer choices, found ${lesson.answerChoices.length}`)
  if (new Set(lesson.answerChoices).size !== lesson.answerChoices.length) add('answer choices contain duplicates')
  if (!lesson.answerChoices.includes(lesson.correctAnswer)) add('correctAnswer is not one of the answer choices')
  if (!lesson.exampleSentence.trim()) add('exampleSentence is empty')
  if (!lesson.explanation.trim()) add('explanation is empty')
  if (!lesson.audioText.trim()) add('audioText is empty')
  if (!lesson.altText.trim()) add('altText is empty')
  if (lesson.altText.length < 20) add('altText should describe the action in a full sentence')
  if (!lesson.caption.trim()) add('caption is empty')
  if (lesson.tags.length === 0) add('at least one tag is required')
  if (lesson.order < 1) add('order must be 1 or greater')
  if (lesson.mistakeHints) {
    for (const key of Object.keys(lesson.mistakeHints)) {
      if (!lesson.answerChoices.includes(key)) add(`mistakeHints key "${key}" is not an answer choice`)
      if (key === lesson.correctAnswer) add('mistakeHints must not describe the correct answer')
    }
  }
  return issues
}
