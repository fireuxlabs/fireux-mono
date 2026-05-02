import { useRoute } from '#imports'
import { computed } from 'vue'
import { useKitchenConsoleSuppliers } from './useKitchenConsoleSuppliers'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenSupplierSurface = Record<string, unknown> & {
  id?: string | null
}

export function useKitchenConsoleSupplier() {
  const route = useRoute()
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    suppliers,
    pending,
  } = useKitchenConsoleSuppliers()

  const supplierId = computed(() => {
    const raw = route.params.supplierId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const supplier = computed<KitchenSupplierSurface | null>(
    () =>
      (suppliers.value.find((item) => normalizeString(item?.id) === supplierId.value) as
        | KitchenSupplierSurface
        | undefined) ??
      null
  )

  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    supplierId: supplierId.value,
    hasSupplier: Boolean(supplier.value),
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    suppliers,
    pending,
    supplierId,
    supplier,
    debug,
  }
}
