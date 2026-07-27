import { computed } from 'vue'
import { SupplierStorage } from 'fireux-suppliers/runtime/models/supplier/Supplier.model'
import type { SupplierSurface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useKitchenSupplierFetch } from './fetch/useKitchenSupplierFetch'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import { useKitchenConsoleSupplyWorkspace } from './useKitchenConsoleSupplyWorkspace'

export function useKitchenConsoleSuppliers() {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const enabled = computed(() => !runtime.isDemo.value)
  const fetchKitchenId = computed(() =>
    rootCollection.value && runtime.storageKitchenId.value
      ? runtime.storageKitchenId.value
      : ''
  )
  const {
    suppliers: fetchedSuppliers,
    pending: fetchedSuppliersPending,
    collectionPath: fetchedCollectionPath,
  } =
    useKitchenSupplierFetch(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
      enabled,
    })
  const supply = useKitchenConsoleSupplyWorkspace()
  const demoSuppliers = computed<SupplierSurface[]>(() =>
    supply.supplierScenarios.value.map(scenario => scenario.supplier)
  )
  const typedSuppliers = computed<SupplierSurface[]>(() =>
    runtime.isDemo.value
      ? demoSuppliers.value
      : fetchedSuppliers.value as SupplierSurface[]
  )
  const suppliersPending = computed(() =>
    runtime.isDemo.value
      ? supply.pending.value
      : fetchedSuppliersPending.value
  )
  const collectionPath = computed(() =>
    runtime.isDemo.value
      ? `demo/kitchens/${kitchenId.value}/suppliers`
      : fetchedCollectionPath.value
  )
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
    unresolvedSupplyLinks: supply.unresolvedLinks.value.map(link => link.id),
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
    suppliers: consoleSuppliers,
    supplierScenarios: supply.supplierScenarios,
    supplyLines: supply.supplyLines,
    unresolvedSupplyLinks: supply.unresolvedLinks,
    count,
    pending,
    debug,
  }
}
