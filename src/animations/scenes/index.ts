import type { ComponentType } from 'react'
import type { SceneProps } from './types'
import { BananaPeelScene } from './BananaPeelScene'
import { PourWaterScene } from './PourWaterScene'
import { BrushTeethScene } from './BrushTeethScene'
import { SliceBreadScene } from './SliceBreadScene'
import { TieShoesScene } from './TieShoesScene'
import { WaterPlantScene } from './WaterPlantScene'

/**
 * Every animated action the learner can watch. Lesson data references these by
 * key, so a lesson never has to import a component directly and new actions
 * can be added without touching the lesson engine.
 */
export const sceneRegistry = {
  'banana-peel': {
    Component: BananaPeelScene as ComponentType<SceneProps>,
    durationMs: 9400,
    /** Frame shown when the learner prefers reduced motion / still mode. */
    stillFrame: 0.7,
    label: 'Hands peeling a banana',
  },
  'pour-water': {
    Component: PourWaterScene as ComponentType<SceneProps>,
    durationMs: 5200,
    stillFrame: 0.62,
    label: 'Water being poured into a glass',
  },
  'brush-teeth': {
    Component: BrushTeethScene as ComponentType<SceneProps>,
    durationMs: 4400,
    stillFrame: 0.35,
    label: 'A hand brushing teeth',
  },
  'slice-bread': {
    Component: SliceBreadScene as ComponentType<SceneProps>,
    durationMs: 4800,
    stillFrame: 0.58,
    label: 'A knife slicing a loaf of bread',
  },
  'tie-shoes': {
    Component: TieShoesScene as ComponentType<SceneProps>,
    durationMs: 5600,
    stillFrame: 0.88,
    label: 'Hands tying a shoelace into a bow',
  },
  'water-plant': {
    Component: WaterPlantScene as ComponentType<SceneProps>,
    durationMs: 5000,
    stillFrame: 0.45,
    label: 'A watering can watering a plant',
  },
} as const

export type AnimationKey = keyof typeof sceneRegistry
export const animationKeys = Object.keys(sceneRegistry) as AnimationKey[]
