import { useAsyncData } from 'nuxt/app'
import { computed, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

import type { DishUsageResponse } from '../../models/dish-usage.model'

export function useDishUsage(kitchenId: Ref<string>, dishId: Ref<string>) {
  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `dish-usage:${currentUser.value?.uid || ''}:${kitchenId.value}:${dishId.value}`
  )
  const { data, error, pending } = useAsyncData<DishUsageResponse | null>(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const user = currentUser.value
      const kitchen = kitchenId.value
      const dish = dishId.value
      if (!user || !kitchen || !dish) return null
      return fetchRead<DishUsageResponse>(
        '/api/workspace/kitchen/dishes/usage',
        {
          query: { kitchenId: kitchen, dishId: dish },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false, watch: [currentUser, kitchenId, dishId] }
  )
  const ready = computed(
    () =>
      !pending.value &&
      !error.value &&
      data.value?.kitchenId === kitchenId.value &&
      data.value?.dishId === dishId.value
  )
  const usages = computed(() => (ready.value ? data.value!.usages : []))
  return { usages, ready, error }
}
