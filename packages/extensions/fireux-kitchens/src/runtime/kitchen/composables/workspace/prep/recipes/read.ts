import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenAccess } from '../../../useKitchenAccess'
import type { Recipe, RecipeInput } from '../../../../../recipe/models/model'

export function useKitchenRecipesRead(
  requestedKitchenId: MaybeRefOrGetter<string>
) {
  const access = useKitchenAccess()
  const kitchenId = computed(() =>
    String(toValue(requestedKitchenId) || '').trim()
  )
  const collectionPath = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(kitchenId.value)
      ? `kitchens/${kitchenId.value}/recipes`
      : ''
  )
  const source = useFirestoreRead({
    databaseId: readRuntimeFirestoreDatabaseId(),
  }).firestoreFetchCollection<Record<string, unknown>>(collectionPath)
  const outcome = computed(() => {
    if (!kitchenId.value) return 'idle'
    if (access.outcome.value === 'pending' || access.outcome.value === 'error')
      return access.outcome.value
    if (!collectionPath.value) return 'empty'
    return source.outcome.value
  })
  const recipes = computed(() =>
    outcome.value === 'ready' ? (source.value || []).map(normalizeRecipe) : []
  )

  return {
    recipes,
    explicitOutputRecipeIds: computed(() =>
      outcome.value === 'ready'
        ? (source.value || [])
            .filter((row) => Object.hasOwn(row, 'output_preparation_id'))
            .map((row) => String(row.id))
        : []
    ),
    outcome,
    error: computed(() => access.error.value || source.error.value),
  }
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

function normalizeRecipe(value: unknown): Recipe {
  const source = record(value)
  const historical = record(source.preparation)
  const amount = record(
    Object.hasOwn(source, 'yield') ? source.yield : historical.yield
  )
  const method = Object.hasOwn(source, 'method')
    ? source.method
    : historical.method
  const inputs: RecipeInput[] = Array.isArray(source.inputs)
    ? source.inputs.flatMap((value) => {
        const row = record(value)
        return (row.kind === 'ingredient' || row.kind === 'preparation') &&
          text(row.reference_id) &&
          typeof row.quantity === 'number' &&
          row.quantity > 0 &&
          text(row.unit)
          ? [
              {
                kind: row.kind,
                reference_id: text(row.reference_id),
                quantity: row.quantity,
                unit: text(row.unit),
                ...(text(row.note) ? { note: text(row.note) } : {}),
              },
            ]
          : []
      })
    : [
        ...readInputs(historical.ingredients, 'ingredient', 'ingredient_id'),
        ...readInputs(historical.prep_items, 'preparation', 'prep_item_id'),
      ]
  const origin = record(source.source)
  return {
    id: text(source.id),
    name: text(source.name),
    ...(text(source.description)
      ? { description: text(source.description) }
      : {}),
    ...(text(source.output_preparation_id)
      ? { output_preparation_id: text(source.output_preparation_id) }
      : {}),
    ...(typeof amount.quantity === 'number' &&
    amount.quantity > 0 &&
    text(amount.unit)
      ? { yield: { quantity: amount.quantity, unit: text(amount.unit) } }
      : {}),
    inputs,
    method: Array.isArray(method)
      ? method
          .filter((step): step is string => typeof step === 'string')
          .map((step) => step.trim())
          .filter(Boolean)
      : [],
    ...(/^https?:\/\//.test(text(origin.url))
      ? {
          source: {
            title: text(origin.title) || 'Recipe source',
            url: text(origin.url),
          },
        }
      : {}),
  }
}
function readInputs(
  value: unknown,
  kind: RecipeInput['kind'],
  key: string
): RecipeInput[] {
  return Array.isArray(value)
    ? value.flatMap((value) => {
        const row = record(value)
        return text(row[key]) &&
          typeof row.quantity === 'number' &&
          row.quantity > 0 &&
          text(row.unit)
          ? [
              {
                kind,
                reference_id: text(row[key]),
                quantity: row.quantity,
                unit: text(row.unit),
                ...(text(row.note) ? { note: text(row.note) } : {}),
              },
            ]
          : []
      })
    : []
}
