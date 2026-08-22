import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceIdentity() {
  const { selection, runtime, actions } = useSupplierWorkspace()

  const name = computed(() =>
    normalizeString(
      selection.supplier.value?.company_place?.short_name ||
        selection.supplier.value?.company_place?.name
    )
  )
  const tagline = computed(() =>
    normalizeString(selection.supplier.value?.company_place?.brand_tagline)
  )
  const headline = computed(() =>
    normalizeString(selection.supplier.value?.company_place?.brand_tagline)
  )
  const summary = computed(() =>
    normalizeString(selection.supplier.value?.company_place?.about)
  )
  const imageUrl = computed(() =>
    normalizeString(
      selection.supplier.value?.company_place?.logo_image ||
        selection.supplier.value?.company_place?.image_url
    )
  )
  const categories = computed(() =>
    []
  )
  const deliveryAreas = computed(() =>
    Array.isArray(selection.supplier.value?.delivery_areas)
      ? selection.supplier.value?.delivery_areas
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
