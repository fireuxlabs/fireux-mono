import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { useIdentity } from 'fireux-core/runtime/composables/fireux/useIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useSupplierWorkspace } from './workspace/core/useSupplierWorkspace'
import { useSupplierWorkspaceIndex } from './workspace/index/useSupplierWorkspaceIndex'

export function useSupplierIdentity() {
  const workspace = useSupplierWorkspace()
  const index = useSupplierWorkspaceIndex()
  const companyId = computed(() => normalizeString(workspace.data.value?.company_id))
  const linkedPlace = usePlaceFetch(companyId)
  const companyPlace = computed(() => linkedPlace.place.value?.id === companyId.value ? linkedPlace.place.value : null)

  const name = computed(() =>
    normalizeString(
      companyPlace.value?.short_name ||
        companyPlace.value?.name
    )
  )
  const tagline = computed(() =>
    normalizeString(companyPlace.value?.tagline)
  )
  const headline = computed(() =>
    normalizeString(companyPlace.value?.tagline)
  )
  const summary = computed(() =>
    normalizeString(companyPlace.value?.about)
  )
  const imageUrl = computed(() =>
    normalizeString(
      companyPlace.value?.logo_image ||
        companyPlace.value?.image_url
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

  const fields = computed(() => ({ name: name.value, tagline: tagline.value, summary: summary.value, imageUrl: imageUrl.value }))
  const status = computed(() => workspace.outcome.value === 'ready' && companyId.value ? linkedPlace.outcome.value : workspace.outcome.value)
  const state = useIdentity({ id: workspace.id, fields, status, canWrite: computed(() => false) })

  return {
    ...state,
    fields,
    companyId,
    placeOutcome: linkedPlace.outcome,
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

export type SupplierIdentityState = ReturnType<
  typeof useSupplierIdentity
>
