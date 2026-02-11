export const RecipeSimple = {
  id: '' as string,
  name: '' as string,
  ingredient_ids: [] as string[],
  mise_ids: [] as string[],
} as const

export type RecipeSimple = {
  [K in keyof typeof RecipeSimple]: (typeof RecipeSimple)[K]
}
