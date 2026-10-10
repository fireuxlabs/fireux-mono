export type RecipeIngredient = {
  ingredient_id: string
  quantity: number
  unit: string
  note: string
}
export type RecipePrepItem = {
  prep_item_id: string
  quantity: number
  unit: string
  note: string
}
export type RecipePreparation = {
  status: 'draft' | 'ready'
  yield: { quantity: number; unit: string }
  ingredients: RecipeIngredient[]
  prep_items: RecipePrepItem[]
  method: string[]
  source_note: string
}
