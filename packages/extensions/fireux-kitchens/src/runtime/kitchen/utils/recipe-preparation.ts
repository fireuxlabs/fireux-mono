import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import type { RecipePreparation } from '../models/recipe-preparation'

export const emptyRecipePreparation = (): RecipePreparation => ({
  status: 'draft',
  yield: { quantity: 1, unit: 'portion' },
  ingredients: [],
  prep_items: [],
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
    prep_items: Array.isArray(source.prep_items)
      ? source.prep_items.map((row) => ({
          prep_item_id: String(row?.prep_item_id || '').trim(),
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
function preparationFields(value: unknown, allowed: string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Enter recipe preparation information.')
  const source = value as Record<string, unknown>
  if (Object.keys(source).some((key) => !allowed.includes(key)))
    throw new Error('Unsupported recipe preparation field.')
  return source
}

/** Validate authored input before normalization; stored-data readers remain separate. */
export function validateRecipePreparation(value: unknown): RecipePreparation {
  const source = preparationFields(value === undefined ? {} : value, [
    'status',
    'yield',
    'ingredients',
    'prep_items',
    'method',
    'source_note',
  ])
  if (
    'status' in source &&
    !['draft', 'ready'].includes(source.status as string)
  )
    throw new Error('Choose Draft or Reviewed for the recipe.')
  if ('yield' in source) {
    const amount = preparationFields(source.yield, ['quantity', 'unit'])
    if (
      ('quantity' in amount && typeof amount.quantity !== 'number') ||
      ('unit' in amount &&
        (typeof amount.unit !== 'string' || !amount.unit.trim()))
    )
      throw new Error('Enter a numeric yield and its unit.')
  }
  for (const [field, idField] of [
    ['ingredients', 'ingredient_id'],
    ['prep_items', 'prep_item_id'],
  ] as const) {
    if (!(field in source)) continue
    const rows = source[field]
    if (!Array.isArray(rows)) throw new Error('Recipe inputs must be a list.')
    for (const row of rows) {
      const input = preparationFields(row, [
        idField,
        'quantity',
        'unit',
        'note',
      ])
      if (
        typeof input[idField] !== 'string' ||
        !isFirestoreDocumentId(input[idField].trim()) ||
        typeof input.quantity !== 'number' ||
        typeof input.unit !== 'string' ||
        ('note' in input && typeof input.note !== 'string')
      )
        throw new Error(
          'Each recipe input needs a valid reference, numeric quantity and unit.'
        )
    }
  }
  if (
    'method' in source &&
    (!Array.isArray(source.method) ||
      source.method.some((step) => typeof step !== 'string'))
  )
    throw new Error('Recipe method steps must contain text.')
  if ('source_note' in source && typeof source.source_note !== 'string')
    throw new Error('Recipe notes must contain text.')
  const result = normalizeRecipePreparation(source)
  if (
    !Number.isFinite(result.yield.quantity) ||
    result.yield.quantity <= 0 ||
    !result.yield.unit ||
    result.yield.unit.length > 40
  )
    throw new Error('Enter a positive yield and its unit.')
  if (
    result.ingredients.length > 100 ||
    result.prep_items.length > 100 ||
    result.method.length > 100
  )
    throw new Error(
      'A recipe can contain up to 100 ingredients, 100 prep items and 100 steps.'
    )
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
  for (const row of result.prep_items) {
    if (
      !row.prep_item_id ||
      row.prep_item_id.includes('/') ||
      !Number.isFinite(row.quantity) ||
      row.quantity <= 0 ||
      !row.unit ||
      row.unit.length > 40 ||
      row.note.length > 500
    )
      throw new Error(
        'Each prep item needs a reference, positive quantity and unit.'
      )
  }
  if (
    result.method.some((step) => step.length > 4000) ||
    result.source_note.length > 2000
  )
    throw new Error('Recipe notes or method are too long.')
  if (
    result.status === 'ready' &&
    (!(result.ingredients.length + result.prep_items.length) ||
      !result.method.length)
  )
    throw new Error(
      'Add ingredients and a method before marking a recipe reviewed.'
    )
  return result
}
