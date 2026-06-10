import { computed } from 'vue'
import { SupplierStorage } from 'fireux-suppliers/runtime/models/supplier/Supplier.model'
import type { SupplierSurface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useKitchenSupplierFetch } from './fetch/useKitchenSupplierFetch'
import { useKitchenConsole } from '../../useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleSuppliers() {
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
  const { suppliers: liveSuppliers, count: liveCount, pending: livePending, collectionPath } =
    useKitchenSupplierFetch(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
    })
  const typedLiveSuppliers = computed<SupplierSurface[]>(() => liveSuppliers.value as SupplierSurface[])
  const page = useKitchenConsoleReadPage<SupplierSurface>({
    collectionName: SupplierStorage.rootCollection,
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: typedLiveSuppliers,
    livePending,
    collectionPath,
  })
  const suppliers = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    mode: selectedMode.value,
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
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    liveCount,
    suppliers,
    count,
    pending,
    debug,
  }
}
