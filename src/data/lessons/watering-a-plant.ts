import type { Lesson } from '../../types/lesson'

export const wateringAPlant: Lesson = {
  id: 'lesson-watering-a-plant',
  slug: 'watering-a-plant',
  title: 'Watering a plant',
  targetPhrase: 'watering a plant',
  question: 'What is this action called?',
  answerChoices: ['Watering a plant', 'Planting a seed', 'Picking flowers', 'Cutting the grass'],
  correctAnswer: 'Watering a plant',
  exampleSentence: 'She is watering the plants on the balcony.',
  explanation:
    'When you give water to plants, you water them. The watering can tips forward and drops fall on the soil, so this action is watering a plant.',
  mistakeHints: {
    'Planting a seed': 'Planting puts a seed in the soil. This plant is already growing in its pot.',
    'Picking flowers': 'Picking means taking a flower with your hand. Nobody touches the plant in this scene.',
    'Cutting the grass': 'Cutting the grass uses a machine or shears and cuts the leaves. Nothing is cut here.',
  },
  animationType: 'water-plant',
  audioText: 'Watering a plant. She is watering the plants on the balcony.',
  altText:
    'A hand holds a metal watering can above a terracotta pot and tips it forward. Small drops of water fall onto the dark soil, the green leaves lift up as the plant drinks, and one new leaf slowly unfurls.',
  caption: 'Watering a plant',
  level: 'A2',
  category: 'nature',
  difficulty: 2,
  tags: ['plants', 'garden', 'home', 'nature'],
  order: 6,
}
