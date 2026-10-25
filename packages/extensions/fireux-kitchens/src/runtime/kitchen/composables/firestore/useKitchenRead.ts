import type { KitchenConfiguration } from '../../models/kitchen-configuration.model'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { Kitchen } from '../../models/kitchen.model'

type UseKitchenReadOptions = {
  collectionPath?: MaybeRefOrGetter<string>
  hydrate?: boolean
}

/** Canonical Kitchen and optional same-ID Place. Presentation belongs to the consumer. */
export function useKitchenRead(
  id: MaybeRefOrGetter<string>,
  options: UseKitchenReadOptions = {}
) {
  const kitchenId = computed(() => String(toValue(id) || '').trim())
  const path = computed(() =>
    options.collectionPath === undefined
      ? 'kitchens'
      : String(toValue(options.collectionPath) || '').trim()
  )
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<Kitchen & KitchenConfiguration>(
    path,
    kitchenId
  )
  const placeId = computed(() =>
    options.hydrate !== false && source.outcome.value === 'ready'
      ? kitchenId.value
      : ''
  )
  const related = firestoreFetchDoc<Place>('places', placeId)
  const error = computed(
    () => source.error.value || (placeId.value ? related.error.value : null)
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: Boolean(path.value && kitchenId.value),
      pending:
        source.pending.value || Boolean(placeId.value && related.pending.value),
      failed: Boolean(error.value),
      present: source.value?.id === kitchenId.value,
    })
  )
  return {
    kitchen: computed(() =>
      outcome.value === 'ready' ? (source.value ?? null) : null
    ),
    place: computed(() =>
      outcome.value === 'ready' &&
      placeId.value &&
      related.value?.id === placeId.value
        ? related.value
        : null
    ),
    placeOutcome: computed(() =>
      placeId.value ? related.outcome.value : 'idle'
    ),
    pending: computed(() => outcome.value === 'pending'),
    error,
    outcome,
  }
}
