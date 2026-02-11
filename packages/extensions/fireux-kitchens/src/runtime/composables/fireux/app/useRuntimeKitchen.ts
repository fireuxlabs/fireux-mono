import { computed, type Ref } from 'vue'
import { dummyKitchenHydrated, dummyKitchenHydratedList } from '../../../../../../../../dummy/kitchen.dummy'

export function useRuntimeKitchen(
  kitchenId?: string | Ref<string | null | undefined>
) {
  return computed(() => {
    if (!kitchenId) return dummyKitchenHydrated
    const raw = typeof kitchenId === 'string' ? kitchenId : kitchenId.value
    const match = dummyKitchenHydratedList.find(
      (kitchen) => String(kitchen.id || '').trim() === String(raw || '').trim()
    )
    return match ?? dummyKitchenHydrated
  })
}
