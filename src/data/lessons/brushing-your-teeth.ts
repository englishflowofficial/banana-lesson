import type { Lesson } from '../../types/lesson'

export const brushingYourTeeth: Lesson = {
  id: 'lesson-brushing-your-teeth',
  slug: 'brushing-your-teeth',
  title: 'Brushing your teeth',
  targetPhrase: 'brushing your teeth',
  question: 'What is this action called?',
  answerChoices: [
    'Brushing your teeth',
    'Washing your face',
    'Combing your hair',
    'Eating your breakfast',
  ],
  correctAnswer: 'Brushing your teeth',
  exampleSentence: 'I brush my teeth every morning and every night.',
  explanation:
    'You brush your teeth with a toothbrush and toothpaste. The brush moves up and down in the mouth, so this action is brushing your teeth.',
  mistakeHints: {
    'Washing your face': 'Washing your face uses a cloth or your hands with water, not a brush in the mouth.',
    'Combing your hair': 'A comb has long thin teeth and moves through hair on top of your head.',
    'Eating your breakfast': 'Eating is putting food in your mouth. A toothbrush is not food.',
  },
  animationType: 'brush-teeth',
  audioText: 'Brushing your teeth. I brush my teeth every morning.',
  altText:
    'A close-up of a smiling face from the side. A hand holds a white and green toothbrush in the mouth; the brush head moves up and down across the upper teeth while small white bubbles of foam gather around it, and the teeth shine at the end.',
  caption: 'Brushing your teeth',
  level: 'A1',
  category: 'self-care',
  difficulty: 1,
  tags: ['routine', 'morning', 'bathroom', 'health'],
  order: 3,
}
