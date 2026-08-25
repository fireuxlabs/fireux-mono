import { computed } from 'vue'
import { SupplierStorage } from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import type { SupplierSurface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
import { useKitchenSupplierFetch } from './fetch/useKitchenSupplierFetch'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'

export function useKitchenWorkspaceSuppliers() {
  const { selection, runtime } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    rootCollection.value && runtime.storageKitchenId.value
      ? runtime.storageKitchenId.value
      : ''
  )
  const {
    suppliers: fetchedSuppliers,
    pending: fetchedSuppliersPending,
    collectionPath: fetchedCollectionPath,
  } = useKitchenSupplierFetch(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const typedSuppliers = computed(
    () => fetchedSuppliers.value as SupplierSurface[]
  )
  const suppliersPending = fetchedSuppliersPending
  const collectionPath = fetchedCollectionPath
  const page = useKitchenWorkspaceReadPage<SupplierSurface>({
    collectionName: SupplierStorage.collection,
    selectedKitchen,
    kitchenId,
    items: typedSuppliers,
    pending: suppliersPending,
    collectionPath,
  })
  const workspaceSuppliers = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: count.value,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    suppliers: workspaceSuppliers,
    count,
    pending,
    debug,
  }
}
