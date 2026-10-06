import type { Lesson, LessonValidationIssue } from '../../types/lesson'
import { validateLesson } from '../../types/lesson'
import { peelingABanana } from './peeling-a-banana'
import { pouringWater } from './pouring-water'
import { brushingYourTeeth } from './brushing-your-teeth'
import { slicingBread } from './slicing-bread'
import { tyingYourShoes } from './tying-your-shoes'
import { wateringAPlant } from './watering-a-plant'

/**
 * The lesson catalogue.
 *
 * Adding a lesson means adding a content module and one line here — the player,
 * library, progress tracking and search all read from this list, so the app
 * scales from six lessons to thousands without UI changes.
 */
export const lessons: Lesson[] = [
  peelingABanana,
  pouringWater,
  brushingYourTeeth,
  slicingBread,
  tyingYourShoes,
  wateringAPlant,
].sort((a, b) => a.order - b.order)

/** Every lesson must pass the content contract before it can be used. */
export const lessonValidationIssues: LessonValidationIssue[] = lessons.flatMap(validateLesson)

if (lessonValidationIssues.length > 0) {
  // Surfaced loudly in dev and in tests rather than shipping broken content.
  console.error(
    'Lesson content problems:',
    lessonValidationIssues.map((i) => `${i.lessonId}: ${i.message}`).join('; '),
  )
}
