import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { useKitchenAccess } from './useKitchenAccess'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../models/kitchen.model'
import {
  readKitchenDocument,
  resolveKitchenPlaceId,
} from '../utils/read-kitchen-document'

export type UseKitchenCollectionReturn = {
  access: ReturnType<typeof useKitchenAccess>
  kitchens: ComputedRef<Kitchen[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<ReadOutcome>
}

/** Granted Kitchens, with optional Place labels for older documents. */
export function useKitchenCollection(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenCollectionReturn {
  const access = useKitchenAccess()
  const { firestoreLoadDocsByIds } = useFirestoreRead()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const kitchenIds = computed(() =>
    enabled.value && access.outcome.value === 'ready'
      ? access.ids.value.map((id) => String(id || '').trim()).filter(Boolean)
      : []
  )
  const kitchenSource = firestoreLoadDocsByIds<
    Record<string, unknown> & { id: string }
  >({
    collectionPath: 'kitchens',
    ids: kitchenIds,
  })
  const parsed = computed(() => {
    const records: (Record<string, unknown> & { id: string })[] = []
    if (
      access.outcome.value !== 'ready' ||
      kitchenSource.outcome.value !== 'ready'
    )
      return { records, invalid: false }
    const allowed = new Set(kitchenIds.value)
    for (const record of kitchenSource.docs.value ?? []) {
      if (!allowed.has(record.id)) continue
      if (!readKitchenDocument(record, record.id))
        return { records: [], invalid: true }
      records.push(record)
    }
    return { records, invalid: false }
  })
  const placeIds = computed(() =>
    parsed.value.records
      .map((record) => resolveKitchenPlaceId(record, record.id))
      .filter(Boolean)
  )
  const placeSource = firestoreLoadDocsByIds<Place>({
    collectionPath: 'places',
    ids: placeIds,
  })
  const places = computed(
    () =>
      new Map((placeSource.docs.value ?? []).map((place) => [place.id, place]))
  )
  const kitchens = computed(() => {
    if (access.outcome.value !== 'ready' || pending.value || error.value)
      return []
    return parsed.value.records.flatMap((record) => {
      const kitchen = readKitchenDocument(
        record,
        record.id,
        places.value.get(resolveKitchenPlaceId(record, record.id))?.name
      )
      return kitchen ? [kitchen] : []
    })
  })
  const pending = computed(
    () =>
      enabled.value &&
      (access.pending.value ||
        access.outcome.value === 'pending' ||
        (kitchenIds.value.length > 0 &&
          ['idle', 'pending'].includes(kitchenSource.outcome.value)))
  )
  const error = computed(() => {
    if (!enabled.value) return undefined
    if (access.error.value) return access.error.value
    if (access.outcome.value !== 'ready' || !kitchenIds.value.length)
      return undefined
    return (
      kitchenSource.error.value ??
      (parsed.value.invalid
        ? new Error('Kitchen source is invalid.')
        : undefined)
    )
  })

  return {
    access,
    kitchens,
    count: computed(() => kitchens.value.length),
    pending,
    error,
    outcome: computed(() => {
      if (!enabled.value) return 'idle'
      if (error.value) return 'error'
      if (pending.value) return 'pending'
      if (access.outcome.value !== 'ready' && access.outcome.value !== 'empty')
        return access.outcome.value
      return kitchens.value.length ? 'ready' : 'empty'
    }),
  }
}
