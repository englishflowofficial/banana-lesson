import type { Category, CategoryId } from '../types/lesson'

export const categories: Category[] = [
  {
    id: 'food',
    label: 'Food & drink',
    description: 'Actions in the kitchen and at the table.',
    accent: 'bg-banana-500',
    accentSoft: 'bg-banana-100',
    accentText: 'text-banana-700',
  },
  {
    id: 'home',
    label: 'Around the home',
    description: 'Everyday jobs and small household tasks.',
    accent: 'bg-lagoon-500',
    accentSoft: 'bg-lagoon-100',
    accentText: 'text-lagoon-700',
  },
  {
    id: 'self-care',
    label: 'Looking after yourself',
    description: 'Morning routines and personal care.',
    accent: 'bg-leaf-500',
    accentSoft: 'bg-leaf-100',
    accentText: 'text-leaf-700',
  },
  {
    id: 'nature',
    label: 'Plants & nature',
    description: 'Growing things and the world outside.',
    accent: 'bg-leaf-500',
    accentSoft: 'bg-leaf-100',
    accentText: 'text-leaf-700',
  },
]

export const categoryById = (id: CategoryId): Category => {
  const found = categories.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown category "${id}"`)
  return found
}

export const levelLabels: Record<string, string> = {
  A1: 'A1 · Beginner',
  A2: 'A2 · Elementary',
  B1: 'B1 · Intermediate',
}

export const difficultyLabels: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Tricky',
}
