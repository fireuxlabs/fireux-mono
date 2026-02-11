export const DishSimple = {
  id: '' as string,
  name: '' as string,
  recipe_id: '' as string,
} as const

export type DishSimple = {
  [K in keyof typeof DishSimple]: (typeof DishSimple)[K]
}
