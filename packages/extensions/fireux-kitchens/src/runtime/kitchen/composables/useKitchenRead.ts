import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import {
  readKitchenDocument,
  resolveKitchenPlaceId,
} from '../utils/read-kitchen-document'

type UseKitchenReadOptions = {
  collectionPath?: MaybeRefOrGetter<string>
  hydrate?: boolean
}

/** Canonical Kitchen with an optional Place lookup. */
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
  const enabled = computed(() => Boolean(path.value && kitchenId.value))
  const source = firestoreFetchDoc<Record<string, unknown>>(path, kitchenId)
  const stale = computed(
    () =>
      enabled.value &&
      source.outcome.value === 'ready' &&
      typeof source.value?.id === 'string' &&
      source.value.id !== kitchenId.value
  )
  const parsed = computed(() =>
    enabled.value &&
    !source.pending.value &&
    !source.error.value &&
    source.outcome.value === 'ready' &&
    !stale.value
      ? readKitchenDocument(source.value, kitchenId.value)
      : null
  )
  const schemaError = computed(() =>
    enabled.value &&
    source.outcome.value === 'ready' &&
    !stale.value &&
    !source.pending.value &&
    !source.error.value &&
    !parsed.value
      ? new Error(`Invalid canonical Kitchen: ${path.value}/${kitchenId.value}`)
      : undefined
  )
  const placeId = computed(() =>
    options.hydrate !== false && parsed.value && source.value
      ? resolveKitchenPlaceId(source.value, kitchenId.value)
      : ''
  )
  const related = firestoreFetchDoc<Place>('places', placeId)
  const error = computed(() =>
    enabled.value ? (source.error.value ?? schemaError.value) : undefined
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: enabled.value,
      pending:
        ['idle', 'pending'].includes(source.outcome.value) ||
        source.pending.value ||
        stale.value,
      failed: Boolean(error.value),
      present: Boolean(parsed.value),
    })
  )
  return {
    root: computed(() =>
      source.pending.value || source.error.value ? null : parsed.value
    ),
    kitchen: computed(() => (outcome.value === 'ready' ? parsed.value : null)),
    place: computed(() =>
      outcome.value === 'ready' &&
      placeId.value &&
      !related.error.value &&
      !related.pending.value &&
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
