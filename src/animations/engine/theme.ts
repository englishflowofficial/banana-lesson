/**
 * Shared scene palette. Scene components may extend or override these, but the
 * defaults keep every lesson inside one consistent, warm illustration language.
 */
export const palette = {
  outline: '#4A3B30',
  outlineSoft: '#6B584A',
  cream: '#FFFCF5',
  creamDeep: '#F8ECDA',
  warmShadow: 'rgba(74, 59, 48, 0.16)',
  warmShadowStrong: 'rgba(74, 59, 48, 0.28)',

  skin: '#E8B48C',
  skinShade: '#D2966C',
  skinLine: '#8A5B3B',
  sleeve: '#7FB5D6',
  sleeveShade: '#5E97BC',

  banana: '#F5C518',
  bananaLight: '#FFE79A',
  bananaShade: '#D9A400',
  bananaDark: '#8A6600',
  bananaFruit: '#FFF3C4',
  bananaFruitShade: '#F3DFA0',

  water: '#63B7D6',
  waterDeep: '#3E8FB0',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassEdge: '#9FC7D6',

  mint: '#7FC8A9',
  mintShade: '#5BA98A',
  toothpaste: '#87C8E8',
  toothpasteStripe: '#E8617F',

  bread: '#E6BE86',
  breadCrust: '#C98F4E',
  breadCrumb: '#F7E4C8',

  denim: '#5B7CA8',
  denimShade: '#44608A',
  shoeBody: '#D95C4A',
  shoeSole: '#FFF8EC',
  lace: '#FFF6E2',

  pot: '#C4703F',
  potShade: '#9E5730',
  soil: '#6B4A32',
  leaf: '#5BA98A',
  leafDark: '#3F8368',
  leafLight: '#8FD3B3',

  metal: '#C7CDD4',
  metalShade: '#98A2AC',
  wood: '#D8A468',
  woodShade: '#B07F45',
} as const

export type Palette = typeof palette

/** Evenly spaced rotation for scenes that fan several parallel objects. */
export const fan = (i: number, count: number, spread: number): number =>
  count <= 1 ? 0 : (i - (count - 1) / 2) * (spread / (count - 1))
