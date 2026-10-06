import type { Lesson } from '../../types/lesson'

export const slicingBread: Lesson = {
  id: 'lesson-slicing-bread',
  slug: 'slicing-bread',
  title: 'Slicing bread',
  targetPhrase: 'slicing bread',
  question: 'What is this action called?',
  answerChoices: ['Slicing bread', 'Baking bread', 'Buying bread', 'Toasting bread'],
  correctAnswer: 'Slicing bread',
  exampleSentence: 'She is slicing bread for the sandwiches.',
  explanation:
    'To slice means to cut something into flat pieces. The knife moves down through the loaf, so this action is slicing bread.',
  mistakeHints: {
    'Baking bread': 'Baking happens in an oven and turns dough into bread. Here the bread is already baked.',
    'Buying bread': 'Buying means paying for bread in a shop. There is no shop and no money in this scene.',
    'Toasting bread': 'Toasting makes bread hot and brown in a toaster. Here the bread stays soft and pale.',
  },
  animationType: 'slice-bread',
  audioText: 'Slicing bread. She is slicing bread for the sandwiches.',
  altText:
    'A hand holds a knife and saws it down through a golden loaf of bread resting on a wooden board. The cut opens, the soft pale inside of the loaf is visible, and the separated slice leans away to the left.',
  caption: 'Slicing bread',
  level: 'A2',
  category: 'food',
  difficulty: 2,
  tags: ['kitchen', 'bread', 'cutting', 'cooking'],
  order: 4,
}
