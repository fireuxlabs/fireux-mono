import type { Ref } from 'vue'
import { useKitchenOrderFetch } from './useKitchenOrderFetch'

export function useKitchenOrdersFetch(
  kitchenId: Ref<string> | string,
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  return useKitchenOrderFetch(kitchenId, options)
}
