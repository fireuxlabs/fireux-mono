import { computed } from 'vue'
import { SupplierStorage } from 'fireux-suppliers/runtime/models/supplier/Supplier.model'
import type { SupplierSurface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useKitchenSupplierFetch } from './fetch/useKitchenSupplierFetch'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleSuppliers() {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { suppliers, count: supplierCount, pending: suppliersPending, collectionPath } =
    useKitchenSupplierFetch(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
    })
  const typedSuppliers = computed<SupplierSurface[]>(() => suppliers.value as SupplierSurface[])
  const page = useKitchenConsoleReadPage<SupplierSurface>({
    collectionName: SupplierStorage.rootCollection,
    selectedKitchen,
    kitchenId,
    items: typedSuppliers,
    pending: suppliersPending,
    collectionPath,
  })
  const consoleSuppliers = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: count.value,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    liveCount: supplierCount,
    suppliers: consoleSuppliers,
    count,
    pending,
    debug,
  }
}
