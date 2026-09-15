import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, type ComputedRef } from 'vue'
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
export function useKitchenCollection(): UseKitchenCollectionReturn {
  const state = useLiveAsyncData<KitchenCollectionRecord[]>(
    'kitchens',
    (liveFetch) => liveFetch<KitchenCollectionRecord[]>('/api/kitchens')
  )
  const collection = computed<KitchenCollectionRecord[]>(
    () => state.data.value || []
  )
  const outcome = computed(() => resolveReadOutcome({
    kind: 'collection', active: true, pending: state.pending.value,
    error: state.error.value, present: collection.value.length > 0,
  }))

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
