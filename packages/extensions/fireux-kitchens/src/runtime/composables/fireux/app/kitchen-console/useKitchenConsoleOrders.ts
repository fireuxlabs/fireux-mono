import { computed } from 'vue'
import { useKitchenOrdersFetch } from '../../firestore/runtime-kitchen/orders/fetch/useKitchenOrdersFetch'
import type { KitchenOrder } from '../../../../models/order.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

export function useKitchenConsoleOrders() {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { orders: liveOrders, pending: livePending, ordersPath } =
    useKitchenOrdersFetch(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
    })
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
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: ordersPath.value,
    count: orders.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath: ordersPath,
    rootCollection,
    canWrite,
    orders,
    pending,
    debug,
  }
}
