import { computed } from 'vue'
import { useKitchenOrdersFetch } from './fetch/useKitchenOrdersFetch'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../../../models/order.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleOrders() {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { orders: liveOrders, pending: livePending, ordersPath } =
    useKitchenOrdersFetch(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<KitchenOrder>({
    collectionName: KitchenOrderStorage.collection,
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
    databaseId: databaseId.value,
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
    databaseId,
    canWrite,
    orders,
    pending,
    debug,
  }
}
