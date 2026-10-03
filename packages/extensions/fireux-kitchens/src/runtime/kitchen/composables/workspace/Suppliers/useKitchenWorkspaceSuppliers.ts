import { computed, inject, provide, ref, watchEffect, type InjectionKey } from 'vue'
import { SupplierStorage } from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import type { SupplierSurface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
import { useKitchenSupplierFetch } from '../../suppliers/useKitchenSupplierFetch'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

function createKitchenWorkspaceSuppliers() {
  const workspace = useKitchenWorkspace()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const readOnly = computed(() => false)
  const canWrite = computed(() => Boolean(workspace.data.value))
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
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
  const selectedSupplierId = ref('')
  const selectedSupplier = computed(
    () =>
      workspaceSuppliers.value.find(
        (supplier) => supplier.id === selectedSupplierId.value
      ) ?? null
  )
  watchEffect(() => {
    if (selectedSupplier.value) return
    selectedSupplierId.value = workspaceSuppliers.value[0]?.id || ''
  })
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
    selectedSupplier,
    selectedSupplierId,
    count,
    pending,
    debug,
  }
}

export type KitchenWorkspaceSuppliers = ReturnType<
  typeof createKitchenWorkspaceSuppliers
>

const kitchenWorkspaceSuppliersKey: InjectionKey<KitchenWorkspaceSuppliers> =
  Symbol('fireux-kitchen-workspace-suppliers')

export function provideKitchenWorkspaceSuppliers() {
  const workspace = createKitchenWorkspaceSuppliers()
  provide(kitchenWorkspaceSuppliersKey, workspace)
  return workspace
}

export function useKitchenWorkspaceSuppliers() {
  return (
    inject(kitchenWorkspaceSuppliersKey, null) ?? createKitchenWorkspaceSuppliers()
  )
}
