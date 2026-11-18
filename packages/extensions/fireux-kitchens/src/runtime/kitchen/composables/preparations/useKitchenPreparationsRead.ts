import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenAccess } from '../useKitchenAccess'
import type { Preparation } from '../../records/preparation'

export function useKitchenPreparationsRead(
  requestedKitchenId: MaybeRefOrGetter<string>
) {
  const access = useKitchenAccess()
  const kitchenId = computed(() =>
    String(toValue(requestedKitchenId) || '').trim()
  )
  const collectionPath = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(kitchenId.value)
      ? `kitchens/${kitchenId.value}/prep-items`
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
  const preparations = computed(() =>
    outcome.value === 'ready'
      ? (source.value || []).map(normalizePreparation)
      : []
  )

  const recipeLinks = computed(() =>
    outcome.value === 'ready'
      ? (source.value || []).flatMap((row) =>
          typeof row.recipe_id === 'string' && row.recipe_id.trim()
            ? [
                {
                  preparationId: String(row.id),
                  recipeId: row.recipe_id.trim(),
                },
              ]
            : []
        )
      : []
  )

  return {
    preparations,
    outcome,
    error: computed(() => access.error.value || source.error.value),
    recipeLinks,
  }
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

function normalizePreparation(value: unknown): Preparation {
  const source = record(value)
  return {
    id: text(source.id),
    name: text(source.name),
    ...(text(source.description)
      ? { description: text(source.description) }
      : {}),
    ...(text(source.image) ? { image: text(source.image) } : {}),
  }
}
