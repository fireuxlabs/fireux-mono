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
  KitchenWorkspaceChoicesResponse,
  KitchenWorkspaceIndexKitchen,
} from '../../../models/kitchen-index.model.ts'

export function useKitchenWorkspaceChoices(
  enabled: MaybeRefOrGetter<boolean>,
  kitchenIds: MaybeRefOrGetter<readonly string[]>
): {
  kitchens: ComputedRef<KitchenWorkspaceIndexKitchen[]>
  refresh: () => Promise<void>
} {
  const { currentUser, hasAuthState } = useAuth()
  const kitchens = ref<KitchenWorkspaceIndexKitchen[]>([])
  let requestSequence = 0

  const load = async () => {
    const user = currentUser.value
    if (
      !import.meta.client ||
      !toValue(enabled) ||
      !hasAuthState.value ||
      !user
    ) {
      kitchens.value = []
      return
    }
    const sequence = ++requestSequence
    const response = await $fetch<KitchenWorkspaceChoicesResponse>(
      '/api/workspace/kitchen/choices',
      { headers: { Authorization: `Bearer ${await user.getIdToken()}` } }
    )
    if (sequence === requestSequence) {
      kitchens.value = [
        ...new Map(response.items.map((item) => [item.id, item])).values(),
      ]
    }
  }

  watch(
    [
      currentUser,
      hasAuthState,
      () => toValue(enabled),
      () => toValue(kitchenIds).join('\u0000'),
    ],
    () => void load(),
    {
      immediate: true,
    }
  )

  return { kitchens: computed(() => kitchens.value), refresh: load }
}
