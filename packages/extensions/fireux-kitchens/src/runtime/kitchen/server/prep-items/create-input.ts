import { createError } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { normalizeKitchenPrepItemTranslatedText } from '../../utils/prep-item'

function invalid(): never {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid Prep Item input.',
  })
}
function fields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some((key) => !allowed.includes(key))) invalid()
  return value
}
function text(value: unknown, required = false) {
  if (typeof value !== 'string') invalid()
  const result = value.trim()
  if (required && !result) invalid()
  return result
}
function optionalText(value: unknown) {
  return text(value === undefined ? '' : value)
}
function quantity(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    invalid()
  return value
}
function unit(value: unknown) {
  if (!['', 'g', 'ml', 'each', 'portion'].includes(value as string)) invalid()
  return value as string
}
function translations(value: unknown) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.values(value).some((copy) => typeof copy !== 'string')
  )
    invalid()
  return normalizeKitchenPrepItemTranslatedText(value)
}
export function readPrepItemCreateInput(input: unknown) {
  const value = fields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const draft = fields(value.draft, [
    'name',
    'description',
    'station',
    'inputs',
    'recipe_id',
    'yield',
    'method',
    'source_language',
    'names',
    'descriptions',
  ])
  const name = text(draft.name, true)
  const id = requireFirestoreDocumentId(normalizeSlug(name), 'Prep Item id')
  const inputs = draft.inputs === undefined ? [] : draft.inputs,
    method = draft.method === undefined ? [] : draft.method
  if (!Array.isArray(inputs) || !Array.isArray(method)) invalid()
  const yieldValue = fields(draft.yield === undefined ? {} : draft.yield, [
    'quantity',
    'unit',
  ])
  const recipeId = optionalText(draft.recipe_id)
  if (recipeId) requireFirestoreDocumentId(recipeId, 'Recipe id')
  const payload = {
    kitchen_id: kitchenId,
    name,
    slug: id,
    description: optionalText(draft.description),
    station: optionalText(draft.station),
    recipe_id: recipeId,
    source_language: text(draft.source_language, true),
    names: translations(draft.names === undefined ? {} : draft.names),
    descriptions: translations(
      draft.descriptions === undefined ? {} : draft.descriptions
    ),
    yield: {
      quantity: quantity(
        yieldValue.quantity === undefined ? 0 : yieldValue.quantity
      ),
      unit: unit(yieldValue.unit === undefined ? '' : yieldValue.unit),
    },
    inputs: inputs.map((value) => {
      const row = fields(value, [
        'ingredient_id',
        'quantity',
        'unit',
        'preparation',
      ])
      return {
        ingredient_id: requireFirestoreDocumentId(
          row.ingredient_id,
          'Ingredient id'
        ),
        quantity: quantity(row.quantity === undefined ? 0 : row.quantity),
        unit: unit(row.unit === undefined ? '' : row.unit),
        preparation: optionalText(row.preparation),
      }
    }),
    method: method.map((value) => text(value)).filter(Boolean),
  }
  return { kitchenId, id, payload }
}
