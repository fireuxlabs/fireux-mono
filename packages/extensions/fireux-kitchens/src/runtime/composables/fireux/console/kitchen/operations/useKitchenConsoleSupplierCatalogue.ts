import {
  getDemoSupplierCatalogueItems,
  getDemoSupplierProductItems,
} from 'fireux-suppliers/runtime/composables/fireux/app/utils/supplier-demo-scenarios'
import { useSupplierCatalogueCollection } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/fetch/useSupplierCatalogueCollection'
import { useSupplierProductCollection } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/fetch/useSupplierProductCollection'
import { computed } from 'vue'
import { useKitchenConsoleSupplier } from './useKitchenConsoleSupplier'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleSupplierCatalogue() {
  const supplierState = useKitchenConsoleSupplier()
  const {
    selectedMode,
    supplierId,
    supplier,
    hasIntegratedCatalogue,
    procurementPath,
  } = supplierState

  const liveEnabled = computed(() =>
    selectedMode.value !== 'demo' &&
    hasIntegratedCatalogue.value &&
    Boolean(supplierId.value)
  )
  const {
    supplierCatalogues,
    pending: supplierCataloguesPending,
  } = useSupplierCatalogueCollection(supplierId, {
    enabled: liveEnabled,
  })
  const {
    supplierProducts,
    pending: supplierProductsPending,
  } = useSupplierProductCollection(supplierId, {
    enabled: liveEnabled,
  })

  const productItems = computed(() =>
    selectedMode.value === 'demo' && supplierId.value
      ? getDemoSupplierProductItems(supplierId.value)
      : supplierProducts.value
  )
  const rawCatalogues = computed(() =>
    selectedMode.value === 'demo' && supplierId.value
      ? getDemoSupplierCatalogueItems(supplierId.value)
      : supplierCatalogues.value
  )
  const catalogues = computed(() =>
    hasIntegratedCatalogue.value
      ? rawCatalogues.value.map((catalogue) => ({
          ...catalogue,
          supplier_products: productItems.value,
        }))
      : []
  )
  const pending = computed(() =>
    selectedMode.value === 'demo'
      ? false
      : supplierCataloguesPending.value || supplierProductsPending.value
  )
  const supplierName = computed(() =>
    normalizeString(supplier.value?.supplier_organization_name) ||
    normalizeString(supplier.value?.name) ||
    supplierId.value
  )
  const title = computed(() =>
    supplierName.value ? `${supplierName.value} Catalogue` : 'Supplier Catalogue'
  )
  const description = computed(() =>
    hasIntegratedCatalogue.value
      ? 'Supplier-owned product options available to this kitchen.'
      : 'This supplier is not in the ecosystem and does not have a supplier catalogue.'
  )

  return {
    ...supplierState,
    catalogues,
    productItems,
    pending,
    title,
    description,
    procurementPath,
  }
}
