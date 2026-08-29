import {
  computed,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type {
  KitchenWorkspaceIndexKitchen,
  KitchenWorkspaceIndexResponse,
} from '../../../models/kitchen-index.model.ts'

export type UseKitchenWorkspaceCurrentResult = {
  kitchen: ComputedRef<KitchenWorkspaceIndexKitchen | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refresh: () => Promise<void>
}

export function useKitchenWorkspaceCurrent(
  kitchenId: MaybeRefOrGetter<string>
): UseKitchenWorkspaceCurrentResult {
  const { currentUser, hasAuthState } = useAuth()
  const kitchen = ref<KitchenWorkspaceIndexKitchen | null>(null)
  const pending = ref(false)
  const error = ref<unknown>()
  let requestSequence = 0

  const load = async () => {
    const user = currentUser.value
    const id = String(toValue(kitchenId) || '').trim()
    if (!import.meta.client || !hasAuthState.value || !user || !id) {
      kitchen.value = null
      pending.value = false
      error.value = undefined
      return
    }

    const sequence = ++requestSequence
    pending.value = true
    error.value = undefined
    try {
      const response = await $fetch<KitchenWorkspaceIndexResponse>(
        '/api/workspace/kitchen/primary',
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
      if (sequence !== requestSequence) return
      kitchen.value = response.current
    } catch (cause) {
      if (sequence !== requestSequence) return
      kitchen.value = null
      error.value = cause
    } finally {
      if (sequence === requestSequence) pending.value = false
    }
  }

  watch(
    [currentUser, hasAuthState, () => toValue(kitchenId)],
    () => void load(),
    {
      immediate: true,
    }
  )

  return {
    kitchen: computed(() => kitchen.value),
    pending: computed(() => pending.value),
    error: computed(() => error.value),
    refresh: load,
  }
}
