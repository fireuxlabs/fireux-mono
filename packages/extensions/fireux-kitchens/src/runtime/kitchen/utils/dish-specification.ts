import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import type { DishSpec } from '../models/dish.model'

export const emptyDishSpecification = (): DishSpec => ({
  portion: 1,
  station: '',
  ingredients: [],
  prep_items: [],
  recipe_ids: [],
  assembly: [],
  source_note: '',
})

function fields(value: unknown, allowed: string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Enter Dish specification information.')
  const source = value as Record<string, unknown>
  if (Object.keys(source).some((key) => !allowed.includes(key)))
    throw new Error('Unsupported Dish specification field.')
  return source
}
function text(value: unknown, required = false): string {
  if (typeof value !== 'string')
    throw new Error('Dish specification text must contain strings.')
  const result = value.trim()
  if (required && !result) throw new Error('Enter a component unit.')
  return result
}
function positive(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
    throw new Error('Enter a positive quantity.')
  return value
}
function id(value: unknown): string {
  if (typeof value !== 'string' || !isFirestoreDocumentId(value.trim()))
    throw new Error('Choose a valid component reference.')
  return value.trim()
}
function rows<Key extends 'ingredient_id' | 'prep_item_id'>(
  value: unknown,
  key: Key
): Array<
  Record<Key, string> & { quantity: number; unit: string; note: string }
> {
  if (!Array.isArray(value)) throw new Error('Dish components must be lists.')
  return value.map((value) => {
    const source = fields(value, [key, 'quantity', 'unit', 'note'])
    return {
      [key]: id(source[key]),
      quantity: positive(source.quantity),
      unit: text(source.unit, true),
      note: text(source.note === undefined ? '' : source.note),
    } as Record<Key, string> & { quantity: number; unit: string; note: string }
  })
}

/** Validate and detach authored input; defaults apply only to omitted text. */
export function validateDishSpecification(value: unknown): DishSpec {
  const source = fields(value, [
    'portion',
    'station',
    'ingredients',
    'prep_items',
    'recipe_ids',
    'assembly',
    'source_note',
  ])
  if (!Array.isArray(source.recipe_ids) || !Array.isArray(source.assembly))
    throw new Error('Recipes and assembly must be lists.')
  return {
    portion: positive(source.portion),
    station: text(source.station === undefined ? '' : source.station),
    ingredients: rows(source.ingredients, 'ingredient_id'),
    prep_items: rows(source.prep_items, 'prep_item_id'),
    recipe_ids: source.recipe_ids.map(id),
    assembly: source.assembly.map((line) => text(line)),
    source_note: text(
      source.source_note === undefined ? '' : source.source_note
    ),
  }
}
