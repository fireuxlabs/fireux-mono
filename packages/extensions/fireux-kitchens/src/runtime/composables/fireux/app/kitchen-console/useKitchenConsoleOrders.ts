import { computed } from 'vue'
import { useKitchenOrdersFetch } from '../../firestore/runtime-kitchen/orders/fetch/useKitchenOrdersFetch'
import type { KitchenOrder } from '../../../../models/order.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleOrders() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() => (selectedMode.value === 'demo' ? '' : kitchenId.value))
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const { orders: liveOrders, pending: livePending, ordersPath } =
    useKitchenOrdersFetch(fetchKitchenId, { kitchenCollectionPath })
  const page = useKitchenConsoleReadPage<KitchenOrder>({
    collectionName: 'orders',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveOrders,
    livePending,
    collectionPath: ordersPath,
  })
  const orders = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath: ordersPath,
    orders,
    pending,
  }
}
