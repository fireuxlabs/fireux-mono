import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, toValue, type MaybeRefOrGetter, type ComputedRef } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../models/kitchen.model.ts'

export type KitchenCollectionRecord = Kitchen & { place: Place }

export type UseKitchenCollectionReturn = {
  collection: ComputedRef<KitchenCollectionRecord[]>
  count: ComputedRef<number>
  ready: Promise<void>
  outcome: ComputedRef<'idle' | 'pending' | 'error' | 'empty' | 'ready'>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown>
  refresh: () => Promise<void>
}

/** Server-rendered Kitchen collection. The client only enhances authorized views. */
export function useKitchenCollection(
  options: { placeId?: MaybeRefOrGetter<string | undefined> } = {}
): UseKitchenCollectionReturn {
  const placeId = computed(() => String(toValue(options.placeId) || '').trim())
  const active = computed(
    () => options.placeId === undefined || Boolean(placeId.value)
  )
  const endpoint = computed(() =>
    placeId.value
      ? `/api/kitchens?placeId=${encodeURIComponent(placeId.value)}`
      : '/api/kitchens'
  )
  const state = useLiveAsyncData<KitchenCollectionRecord[]>(
    () =>
      options.placeId === undefined
        ? 'kitchens'
        : `kitchens:place:${placeId.value || 'inactive'}`,
    (liveFetch) =>
      active.value
        ? liveFetch<KitchenCollectionRecord[]>(endpoint.value)
        : Promise.resolve([]),
    { watch: [endpoint, active] }
  )
  const collection = computed<KitchenCollectionRecord[]>(() => {
    if (!active.value || state.pending.value || state.error.value) return []
    if (options.placeId === undefined) return state.data.value || []
    return (state.data.value || []).filter(
      (kitchen) => kitchen.id === placeId.value
    )
  })
  const outcome = computed(() =>
    resolveReadOutcome({
      kind: 'collection',
      active: active.value,
      pending: state.pending.value,
      error: state.error.value,
      present: collection.value.length > 0,
    })
  )

  return {
    collection,
    count: computed(() => collection.value.length),
    pending: computed(() => state.pending.value),
    error: computed<unknown>(() => state.error.value),
    refresh: async () => {
      await state.refresh()
    },
    ready: state.then(() => undefined),
    outcome,
  }
}
