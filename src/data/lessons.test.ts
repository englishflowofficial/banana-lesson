import { describe, expect, it } from 'vitest'
import { lessonValidationIssues, lessons } from './lessons'
import { animationKeys, sceneRegistry } from '../animations/scenes'
import { categoryById } from './categories'

describe('lesson catalogue', () => {
  it('contains at least six lessons', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(6)
  })

  it('passes every content rule', () => {
    expect(lessonValidationIssues).toEqual([])
  })

  it('uses unique ids, slugs and order values', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length)
    expect(new Set(lessons.map((l) => l.slug)).size).toBe(lessons.length)
    expect(new Set(lessons.map((l) => l.order)).size).toBe(lessons.length)
  })

  it('points every lesson at an animation that exists', () => {
    for (const lesson of lessons) {
      expect(animationKeys).toContain(lesson.animationType)
      expect(sceneRegistry[lesson.animationType]).toBeDefined()
    }
  })

  it('uses a known category for every lesson', () => {
    for (const lesson of lessons) {
      expect(() => categoryById(lesson.category)).not.toThrow()
    }
  })

  it('gives every lesson four distinct options including the answer', () => {
    for (const lesson of lessons) {
      expect(lesson.answerChoices).toHaveLength(4)
      expect(new Set(lesson.answerChoices).size).toBe(4)
      expect(lesson.answerChoices).toContain(lesson.correctAnswer)
    }
  })

  it('starts with the flagship banana lesson', () => {
    expect(lessons[0].slug).toBe('peeling-a-banana')
    expect(lessons[0].correctAnswer).toBe('Peeling a banana')
    expect(lessons[0].animationType).toBe('banana-peel')
    expect(lessons[0].answerChoices).toEqual([
      'Peeling a banana',
      'Cutting a banana',
      'Washing a banana',
      'Eating a banana',
    ])
  })

  it('orders lessons without gaps', () => {
    lessons.forEach((lesson, index) => expect(lesson.order).toBe(index + 1))
  })
})
