/** Saved authored preparation details retained by Recipe create and update. */
export type RecipePreparation = {
  status: 'draft' | 'ready'
  yield: { quantity: number; unit: string }
  ingredients: Array<{
    ingredient_id: string
    quantity: number
    unit: string
    note: string
  }>
  prep_items: Array<{
    prep_item_id: string
    quantity: number
    unit: string
    note: string
  }>
  method: string[]
  source_note: string
}
