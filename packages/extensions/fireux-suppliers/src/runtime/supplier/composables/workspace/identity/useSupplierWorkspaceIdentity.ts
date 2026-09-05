import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'
import { useSupplierWorkspaceIndex } from '../index/useSupplierWorkspaceIndex'

export function useSupplierWorkspaceIdentity() {
  const workspace = useSupplierWorkspace()
  const index = useSupplierWorkspaceIndex()

  const name = computed(() =>
    normalizeString(
      workspace.data.value?.company_place?.short_name ||
        workspace.data.value?.company_place?.name
    )
  )
  const tagline = computed(() =>
    normalizeString(workspace.data.value?.company_place?.tagline)
  )
  const headline = computed(() =>
    normalizeString(workspace.data.value?.company_place?.tagline)
  )
  const summary = computed(() =>
    normalizeString(workspace.data.value?.company_place?.about)
  )
  const imageUrl = computed(() =>
    normalizeString(
      workspace.data.value?.company_place?.logo_image ||
        workspace.data.value?.company_place?.image_url
    )
  )
  const categories = computed(() => [])
  const deliveryAreas = computed(() =>
    Array.isArray(workspace.data.value?.delivery_areas)
      ? workspace.data.value?.delivery_areas
      : []
  )
  const debug = computed(() => ({
    supplierId: workspace.id.value,
    name: name.value,
    tagline: tagline.value,
    headline: headline.value,
    summary: summary.value,
    selectedSupplier: workspace.data.value,
  }))

  return {
    selectedSupplier: workspace.data,
    supplierId: workspace.id,
    clearSelectedSupplier: index.clear,
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
