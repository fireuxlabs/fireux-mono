import { computed, type Ref } from 'vue'
import { useOrdersForKitchenFetch } from 'fireux-orders/runtime/composables/useOrdersForKitchenFetch'

export function useKitchenOrdersFetch(kitchenId: Ref<string> | string) {
  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const { orders } = useOrdersForKitchenFetch(resolvedKitchenId)

  return {
    kitchenId: resolvedKitchenId,
    orders,
  }
}
