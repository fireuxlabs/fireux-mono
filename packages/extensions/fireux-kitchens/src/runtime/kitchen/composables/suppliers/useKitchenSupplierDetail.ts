import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useKitchenSupplierFetch } from './useKitchenSupplierFetch'
import { useKitchenAccess } from '../useKitchenAccess'

const normalizeString = (value: unknown) => String(value ?? '').trim()
import type { SupplierSurface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
type KitchenSupplierSurface = SupplierSurface

export function useKitchenSupplierDetail(
  requestedKitchenId: MaybeRefOrGetter<string>,
  requestedSupplierId: MaybeRefOrGetter<string>
) {
  const access = useKitchenAccess()
  const kitchenId = computed(() =>
    String(toValue(requestedKitchenId) || '').trim()
  )
  const supplierId = computed(() =>
    String(toValue(requestedSupplierId) || '').trim()
  )
  const rootCollection = computed(() => 'kitchens')
  const storageKitchenId = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(kitchenId.value)
      ? kitchenId.value
      : ''
  )
  const { suppliers, pending, collectionPath } =
    useKitchenSupplierFetch(storageKitchenId)
  const readOnly = computed(() => true)
  const canWrite = computed(() => false)
  const supplier = computed<KitchenSupplierSurface | null>(
    () =>
      (suppliers.value.find(
        (item) => normalizeString(item?.id) === supplierId.value
      ) as KitchenSupplierSurface | undefined) ?? null
  )
  const supplierState = computed(() =>
    normalizeString(supplier.value?.identity?.status)
  )
  const catalogueState = computed(() =>
    normalizeString(supplier.value?.catalogue?.mode)
  )
  const hasIntegratedCatalogue = computed(
    () => catalogueState.value === 'integrated'
  )
  const isEcosystemSupplier = computed(
    () => supplierState.value === 'active' || hasIntegratedCatalogue.value
  )
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    supplierId: supplierId.value,
    hasSupplier: Boolean(supplier.value),
    supplierState: supplierState.value,
    catalogueState: catalogueState.value,
    hasIntegratedCatalogue: hasIntegratedCatalogue.value,
    isEcosystemSupplier: isEcosystemSupplier.value,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    suppliers,
    pending,
    supplierId,
    supplier,
    supplierState,
    catalogueState,
    hasIntegratedCatalogue,
    isEcosystemSupplier,
    debug,
  }
}
