export const MiseEnPlaceSimple = {
  id: '' as string,
  description: '' as string,
  ingredient_id: '' as string,
} as const

export type MiseEnPlaceSimple = {
  [K in keyof typeof MiseEnPlaceSimple]: (typeof MiseEnPlaceSimple)[K]
}
