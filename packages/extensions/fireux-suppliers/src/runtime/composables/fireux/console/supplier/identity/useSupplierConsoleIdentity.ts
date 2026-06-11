import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useSupplierConsole } from '../core/useSupplierConsole'

export function useSupplierConsoleIdentity() {
  const {
    selectedSupplier,
    selectedMode,
    supplierId,
    activeSupplierAppId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
  } = useSupplierConsole()

  const name = computed(() =>
    normalizeString(selectedSupplier.value?.supplier_organization_name)
  )
  const tagline = computed(() => normalizeString((selectedSupplier.value as any)?.tagline))
  const headline = computed(() => normalizeString(selectedSupplier.value?.supplier_headline))
  const summary = computed(() => normalizeString(selectedSupplier.value?.summary))
  const imageUrl = computed(() => normalizeString(selectedSupplier.value?.supplier_image))
  const categories = computed(() =>
    Array.isArray(selectedSupplier.value?.supplier_item_categories)
      ? selectedSupplier.value?.supplier_item_categories
      : []
  )
  const deliveryAreas = computed(() =>
    Array.isArray(selectedSupplier.value?.supplier_delivery_areas)
      ? selectedSupplier.value?.supplier_delivery_areas
      : []
  )
  const debug = computed(() => ({
    selectedMode: selectedMode.value,
    supplierId: supplierId.value,
    activeSupplierAppId: activeSupplierAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    tagline: tagline.value,
    headline: headline.value,
    summary: summary.value,
    selectedSupplier: selectedSupplier.value,
  }))

  return {
    selectedSupplier,
    selectedMode,
    supplierId,
    activeSupplierAppId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
    name,
    tagline,
    headline,
    summary,
    imageUrl,
    categories,
    deliveryAreas,
    debug,
  }
}

export type SupplierConsoleIdentityState = ReturnType<
  typeof useSupplierConsoleIdentity
>
