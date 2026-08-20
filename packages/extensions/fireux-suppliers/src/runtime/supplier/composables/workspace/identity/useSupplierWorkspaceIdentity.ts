import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceIdentity() {
  const {
    selection,
    runtime,
    actions,
  } = useSupplierWorkspace()

  const name = computed(() =>
    normalizeString(selection.supplier.value?.supplier_organization_name)
  )
  const tagline = computed(() => normalizeString((selection.supplier.value as any)?.tagline))
  const headline = computed(() => normalizeString(selection.supplier.value?.supplier_headline))
  const summary = computed(() => normalizeString(selection.supplier.value?.summary))
  const imageUrl = computed(() => normalizeString(selection.supplier.value?.supplier_image))
  const categories = computed(() =>
    Array.isArray(selection.supplier.value?.supplier_item_categories)
      ? selection.supplier.value?.supplier_item_categories
      : []
  )
  const deliveryAreas = computed(() =>
    Array.isArray(selection.supplier.value?.supplier_delivery_areas)
      ? selection.supplier.value?.supplier_delivery_areas
      : []
  )
  const debug = computed(() => ({
    supplierId: selection.supplierId.value,
    activeSupplierAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    name: name.value,
    tagline: tagline.value,
    headline: headline.value,
    summary: summary.value,
    selectedSupplier: selection.supplier.value,
  }))

  return {
    selectedSupplier: selection.supplier,
    supplierId: selection.supplierId,
    activeSupplierAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedSupplier: actions.clearSelectedSupplier,
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

export type SupplierWorkspaceIdentityState = ReturnType<
  typeof useSupplierWorkspaceIdentity
>
