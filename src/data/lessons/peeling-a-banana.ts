import type { Lesson } from '../../types/lesson'

/** Flagship lesson: the fully polished banana-peeling animation. */
export const peelingABanana: Lesson = {
  id: 'lesson-peeling-a-banana',
  slug: 'peeling-a-banana',
  title: 'Peeling a banana',
  targetPhrase: 'peeling a banana',
  question: 'What is this action called?',
  answerChoices: ['Peeling a banana', 'Cutting a banana', 'Washing a banana', 'Eating a banana'],
  correctAnswer: 'Peeling a banana',
  exampleSentence: 'She is peeling a banana for her little brother.',
  explanation:
    'When you take the skin off fruit or vegetables, you peel it. The hands pull the yellow skin down, so this action is peeling a banana.',
  mistakeHints: {
    'Cutting a banana': 'A knife cuts. In this animation the hands pull the skin off, so we say peeling.',
    'Washing a banana': 'Washing uses water. There is no water here — the hands are opening the skin.',
    'Eating a banana': 'Eating comes after peeling. Peeling is the first step, before you take a bite.',
  },
  animationType: 'banana-peel',
  audioText: 'Peeling a banana. She is peeling a banana.',
  altText:
    'A yellow banana is held upright by one hand. A second hand bends the dark stem back until it snaps open, then three sections of yellow skin fold down one after another to reveal the pale fruit inside, which glows and stays visible.',
  caption: 'Peeling a banana',
  level: 'A1',
  category: 'food',
  difficulty: 1,
  tags: ['food', 'fruit', 'hands', 'everyday'],
  order: 1,
}
