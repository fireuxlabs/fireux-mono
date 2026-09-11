import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, type ComputedRef } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../models/kitchen.model.ts'

export type KitchenCollectionRecord = Kitchen & { place: Place }

export type UseKitchenCollectionReturn = {
  collection: ComputedRef<KitchenCollectionRecord[]>
  count: ComputedRef<number>
  canViewHidden: ComputedRef<boolean>
  ready: Promise<void>
  outcome: ComputedRef<'pending' | 'error' | 'empty' | 'ready'>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown>
  refresh: () => Promise<void>
}

/** Server-rendered Kitchen collection. The client only enhances authorized views. */
export function useKitchenCollection(): UseKitchenCollectionReturn {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid || '').trim())
  const state = useLiveAsyncData<KitchenCollectionRecord[]>(
    'kitchens',
    (liveFetch) => liveFetch<KitchenCollectionRecord[]>('/api/kitchens')
  )
  const hidden = useLiveAsyncData<KitchenCollectionRecord[] | null>(
    computed(() => `hidden-kitchens:${uid.value}`),
    async (liveFetch) => {
      const user = currentUser.value
      if (!hasAuthState.value || !user) return null
      return liveFetch<KitchenCollectionRecord[]>(
        '/api/kitchens?includeHidden=true',
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false, watch: [hasAuthState] }
  )
  const hiddenKitchens = computed(() =>
    hidden.error.value ? null : hidden.data.value
  )
  const collection = computed<KitchenCollectionRecord[]>(
    () => hiddenKitchens.value || state.data.value || []
  )
  const outcome = computed<'pending' | 'error' | 'empty' | 'ready'>(() => {
    if (state.pending.value) return 'pending'
    if (state.error.value || !state.data.value) return 'error'
    return collection.value.length ? 'ready' : 'empty'
  })

  return {
    collection,
    count: computed(() => collection.value.length),
    canViewHidden: computed(() => Boolean(hiddenKitchens.value)),
    pending: computed(() => state.pending.value),
    error: computed<unknown>(() => state.error.value),
    refresh: async () => {
      await state.refresh()
      await hidden.refresh()
    },
    ready: state.then(() => undefined),
    outcome,
  }
}
