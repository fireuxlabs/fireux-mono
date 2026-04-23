import { computed } from 'vue'
import type { SupplierSurface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useKitchenSupplierFetch } from '../../firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleSuppliers() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() => (selectedMode.value === 'demo' ? '' : kitchenId.value))
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const { suppliers: liveSuppliers, count: liveCount, pending: livePending, collectionPath } =
    useKitchenSupplierFetch(fetchKitchenId, { kitchenCollectionPath })
  const typedLiveSuppliers = computed<SupplierSurface[]>(() => liveSuppliers.value as SupplierSurface[])
  const page = useKitchenConsoleReadPage<SupplierSurface>({
    collectionName: 'suppliers',
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

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    liveCount,
    suppliers,
    count,
    pending,
  }
}
