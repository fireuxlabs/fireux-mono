export type RecipeIngredient = {
  ingredient_id: string
  quantity: number
  unit: string
  note: string
}
export type RecipePreparation = {
  status: 'draft' | 'ready'
  yield: { quantity: number; unit: string }
  ingredients: RecipeIngredient[]
  method: string[]
  source_note: string
}
export const emptyRecipePreparation = (): RecipePreparation => ({
  status: 'draft',
  yield: { quantity: 1, unit: 'portion' },
  ingredients: [],
  method: [],
  source_note: '',
})
export function normalizeRecipePreparation(value: unknown): RecipePreparation {
  const source =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const amount =
    source.yield && typeof source.yield === 'object'
      ? (source.yield as Record<string, unknown>)
      : {}
  return {
    status: source.status === 'ready' ? 'ready' : 'draft',
    yield: {
      quantity: amount.quantity == null ? 1 : Number(amount.quantity),
      unit: String(amount.unit || 'portion').trim(),
    },
    ingredients: Array.isArray(source.ingredients)
      ? source.ingredients.map((row) => ({
          ingredient_id: String(row?.ingredient_id || '').trim(),
          quantity: Number(row?.quantity) || 0,
          unit: String(row?.unit || '').trim(),
          note: String(row?.note || '').trim(),
        }))
      : [],
    method: Array.isArray(source.method)
      ? source.method
          .map(String)
          .map((step) => step.trim())
          .filter(Boolean)
      : [],
    source_note: String(source.source_note || '').trim(),
  }
}
export function validateRecipePreparation(value: unknown): RecipePreparation {
  const result = normalizeRecipePreparation(value)
  if (
    !Number.isFinite(result.yield.quantity) ||
    result.yield.quantity <= 0 ||
    !result.yield.unit ||
    result.yield.unit.length > 40
  )
    throw new Error('Enter a positive yield and its unit.')
  if (result.ingredients.length > 100 || result.method.length > 100)
    throw new Error('A recipe can contain up to 100 ingredients and 100 steps.')
  for (const row of result.ingredients) {
    if (
      !row.ingredient_id ||
      row.ingredient_id.includes('/') ||
      !Number.isFinite(row.quantity) ||
      row.quantity <= 0 ||
      !row.unit ||
      row.unit.length > 40 ||
      row.note.length > 500
    )
      throw new Error(
        'Each ingredient needs an ingredient, a positive quantity and a unit.'
      )
  }
  if (
    result.method.some((step) => step.length > 4000) ||
    result.source_note.length > 2000
  )
    throw new Error('Recipe notes or method are too long.')
  if (
    result.status === 'ready' &&
    (!result.ingredients.length || !result.method.length)
  )
    throw new Error(
      'Add ingredients and a method before marking a recipe reviewed.'
    )
  return result
}
