import { useAsyncData } from 'nuxt/app'
import { computed, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

import type { ItemUsageResponse } from './item-usage'

export function useItemUsage(kitchenId: Ref<string>, itemId: Ref<string>) {
  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `dish-usage:${currentUser.value?.uid || ''}:${kitchenId.value}:${itemId.value}`
  )
  const { data, error, pending } = useAsyncData<ItemUsageResponse | null>(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const user = currentUser.value
      const kitchen = kitchenId.value
      const dish = itemId.value
      if (!user || !kitchen || !dish) return null
      return fetchRead<ItemUsageResponse>(
        '/api/workspace/kitchen/items/usage',
        {
          query: { kitchenId: kitchen, itemId: dish },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false, watch: [currentUser, kitchenId, itemId] }
  )
  const ready = computed(
    () =>
      !pending.value &&
      !error.value &&
      data.value?.kitchenId === kitchenId.value &&
      data.value?.itemId === itemId.value
  )
  const usages = computed(() => (ready.value ? data.value!.usages : []))
  return { usages, ready, error }
}
