import { useAsyncData } from '#imports'
import { computed, ref, watch, type ComputedRef } from 'vue'
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
  const state = useAsyncData<KitchenCollectionRecord[]>('kitchens', () =>
    $fetch<KitchenCollectionRecord[]>('/api/kitchens')
  )
  const hiddenKitchens = ref<KitchenCollectionRecord[] | null>(null)
  let hiddenGeneration = 0

  async function requestHidden() {
    const generation = ++hiddenGeneration
    const user = currentUser.value
    const requestUid = uid.value
    hiddenKitchens.value = null
    if (
      !import.meta.client ||
      !hasAuthState.value ||
      !user ||
      user.uid !== requestUid
    )
      return

    try {
      const token = await user.getIdToken()
      const kitchens = await $fetch<KitchenCollectionRecord[]>(
        '/api/kitchens?includeHidden=true',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (generation === hiddenGeneration && uid.value === requestUid) {
        hiddenKitchens.value = kitchens
      }
    } catch {
      // Public Kitchens remain available when hidden access is not authorized.
    }
  }

  if (import.meta.client) {
    watch([hasAuthState, uid], () => void requestHidden(), {
      immediate: true,
      flush: 'post',
    })
  }

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
      void requestHidden()
    },
    ready: state.then(() => undefined),
    outcome,
  }
}
