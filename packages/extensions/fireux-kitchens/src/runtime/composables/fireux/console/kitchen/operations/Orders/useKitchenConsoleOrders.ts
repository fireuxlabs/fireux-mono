import { computed } from 'vue'
import { useKitchenOrdersFetch } from './fetch/useKitchenOrdersFetch'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../../../../models/order.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleOrders() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { orders, pending: ordersPending, ordersPath } =
    useKitchenOrdersFetch(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<KitchenOrder>({
    collectionName: KitchenOrderStorage.collection,
    selectedKitchen,
    kitchenId,
    items: orders,
    pending: ordersPending,
    collectionPath: ordersPath,
  })
  const consoleOrders = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: ordersPath.value,
    count: consoleOrders.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath: ordersPath,
    rootCollection,
    databaseId,
    canWrite,
    orders: consoleOrders,
    pending,
    debug,
  }
}
