import { computed, type Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useOrdersForKitchenFetch } from 'fireux-orders/runtime/composables/useOrdersForKitchenFetch'

export function useKitchenOrdersFetch(kitchenId: Ref<string> | string) {
  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const { orders } = useOrdersForKitchenFetch(resolvedKitchenId)
  const { byId: order } = useCollectionById(orders)

  return {
    kitchenId: resolvedKitchenId,
    orders,
    order,
  }
}
