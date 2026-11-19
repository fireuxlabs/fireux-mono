import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import type { Recipe, RecipeInput } from '../models/model'
export type RecipeChanges = Partial<
  Pick<Recipe, 'name' | 'description' | 'inputs' | 'method'>
> & {
  output_preparation_id?: string | null
  yield?: Recipe['yield'] | null
  source?: Recipe['source'] | null
}
const fields = (value: unknown, allowed: string[]) => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Enter Recipe information.')
  const record = value as Record<string, unknown>
  if (Object.keys(record).some((key) => !allowed.includes(key)))
    throw new Error('Unsupported Recipe field.')
  return record
}
const text = (value: unknown, max: number, required = true) => {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new Error('Enter valid Recipe text.')
  return value.trim()
}
const id = (value: unknown) => {
  if (typeof value !== 'string' || !isFirestoreDocumentId(value))
    throw new Error('Choose a valid Kitchen record.')
  return value
}
const quantity = (value: unknown) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
    throw new Error('Enter a positive quantity.')
  return value
}
export function readRecipeChanges(value: unknown): RecipeChanges {
  const source = fields(value, [
    'name',
    'description',
    'output_preparation_id',
    'yield',
    'inputs',
    'method',
    'source',
  ])
  if (!Object.keys(source).length) throw new Error('Enter Recipe changes.')
  const changes: RecipeChanges = {}
  if ('name' in source) changes.name = text(source.name, 140)
  if ('description' in source)
    changes.description = text(source.description, 2000, false)
  if ('output_preparation_id' in source)
    changes.output_preparation_id =
      source.output_preparation_id === null
        ? null
        : id(source.output_preparation_id)
  if ('yield' in source) {
    const amount =
      source.yield === null ? null : fields(source.yield, ['quantity', 'unit'])
    changes.yield = amount
      ? { quantity: quantity(amount.quantity), unit: text(amount.unit, 40) }
      : null
  }
  if ('inputs' in source) {
    if (!Array.isArray(source.inputs) || source.inputs.length > 100)
      throw new Error('Use up to 100 recipe inputs.')
    changes.inputs = source.inputs.map((value): RecipeInput => {
      const row = fields(value, [
        'kind',
        'reference_id',
        'quantity',
        'unit',
        'note',
      ])
      if (row.kind !== 'ingredient' && row.kind !== 'preparation')
        throw new Error('Choose Ingredient or Preparation.')
      return {
        kind: row.kind,
        reference_id: id(row.reference_id),
        quantity: quantity(row.quantity),
        unit: text(row.unit, 40),
        ...(row.note !== undefined ? { note: text(row.note, 500, false) } : {}),
      }
    })
  }
  if ('method' in source) {
    if (!Array.isArray(source.method) || source.method.length > 100)
      throw new Error('Use up to 100 method steps.')
    changes.method = source.method.map((step) => text(step, 4000))
  }
  if ('source' in source) {
    const origin =
      source.source === null ? null : fields(source.source, ['title', 'url'])
    if (!origin) changes.source = null
    else {
      const url = new URL(text(origin.url, 2000))
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error('Use an HTTP or HTTPS source URL.')
      changes.source = { title: text(origin.title, 200), url: url.href }
    }
  }
  return changes
}
