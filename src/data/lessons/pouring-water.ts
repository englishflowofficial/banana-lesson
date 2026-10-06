import type { Lesson } from '../../types/lesson'

export const pouringWater: Lesson = {
  id: 'lesson-pouring-water',
  slug: 'pouring-water',
  title: 'Pouring water',
  targetPhrase: 'pouring water',
  question: 'What is this action called?',
  answerChoices: ['Pouring water', 'Drinking water', 'Boiling water', 'Washing a glass'],
  correctAnswer: 'Pouring water',
  exampleSentence: 'He is pouring water into a glass.',
  explanation:
    'When you tip a jug or a bottle so the liquid flows out, you pour. The stream of water leaves the jug, so this action is pouring water.',
  mistakeHints: {
    'Drinking water': 'Drinking happens with your mouth. Here the water goes from the jug into a glass.',
    'Boiling water': 'Boiling means heating water until it bubbles in a pot. This water is cold and moving quietly.',
    'Washing a glass': 'Washing a glass uses water, but the glass stays on the table and is not cleaned here.',
  },
  animationType: 'pour-water',
  audioText: 'Pouring water. He is pouring water into a glass.',
  altText:
    'A hand tilts a glass jug forward and a smooth stream of water falls from the spout into a tall glass standing on the table. The water level in the glass rises slowly while ripples spread on the surface.',
  caption: 'Pouring water',
  level: 'A1',
  category: 'food',
  difficulty: 1,
  tags: ['kitchen', 'water', 'drinks', 'everyday'],
  order: 2,
}
