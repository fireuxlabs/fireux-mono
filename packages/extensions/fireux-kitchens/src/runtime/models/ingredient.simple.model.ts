export const IngredientSimple = {
  id: '' as string,
  name: '' as string,
  unit: 'piece' as 'piece' | 'g' | 'ml',
} as const

export type IngredientSimple = {
  [K in keyof typeof IngredientSimple]: (typeof IngredientSimple)[K]
}
