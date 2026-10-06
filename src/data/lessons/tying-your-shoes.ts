import type { Lesson } from '../../types/lesson'

export const tyingYourShoes: Lesson = {
  id: 'lesson-tying-your-shoes',
  slug: 'tying-your-shoes',
  title: 'Tying your shoes',
  targetPhrase: 'tying your shoes',
  question: 'What is this action called?',
  answerChoices: [
    'Tying your shoes',
    'Cleaning your shoes',
    'Putting on your socks',
    'Taking off your shoes',
  ],
  correctAnswer: 'Tying your shoes',
  exampleSentence: 'He ties his shoes before he leaves the house.',
  explanation:
    'When you make a knot with the laces, you tie your shoes. The two lace ends cross and turn into a bow, so this action is tying your shoes.',
  mistakeHints: {
    'Cleaning your shoes': 'Cleaning uses a brush or a cloth and makes the shoe dirty-free. Here only the laces move.',
    'Putting on your socks': 'Socks go on the feet inside the shoe. The foot is already inside the shoe here.',
    'Taking off your shoes': 'Taking off means loosening the shoe so the foot can come out. This animation makes the bow tighter, not looser.',
  },
  animationType: 'tie-shoes',
  audioText: 'Tying your shoes. He ties his shoes before he leaves the house.',
  altText:
    'Two hands pull the ends of a white shoelace across each other, then a loop grows on the left, a second loop grows on the right, and the two loops are pulled into a neat bow on the front of a red shoe.',
  caption: 'Tying your shoes',
  level: 'A2',
  category: 'self-care',
  difficulty: 2,
  tags: ['clothes', 'routine', 'hands', 'getting dressed'],
  order: 5,
}
