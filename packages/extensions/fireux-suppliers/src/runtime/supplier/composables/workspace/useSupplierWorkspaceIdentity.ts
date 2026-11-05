import { useSupplierAccess } from '../useSupplierAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { useWorkspaceIdentity } from 'fireux-core/runtime/workspace/composables/useWorkspaceIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/normalize-string'
import { useSupplierWorkspace } from './useSupplierWorkspace'

export function useSupplierWorkspaceIdentity() {
  const workspace = useSupplierWorkspace()
  const access = useSupplierAccess()
  const { currentUser } = useAuth()
  const businessId = computed(() =>
    normalizeString(workspace.data.value?.business_id)
  )
  const linkedPlace = usePlaceFetch(businessId)
  const businessPlace = computed(() =>
    linkedPlace.place.value?.id === businessId.value
      ? linkedPlace.place.value
      : null
  )

  const name = computed(() =>
    normalizeString(businessPlace.value?.short_name || businessPlace.value?.name)
  )
  const tagline = computed(() => normalizeString(businessPlace.value?.tagline))
  const summary = computed(() => normalizeString(businessPlace.value?.about))
  const imageUrl = computed(() =>
    normalizeString(
      businessPlace.value?.logo_image || businessPlace.value?.image_url
    )
  )
  const debug = computed(() => ({
    supplierId: workspace.id.value,
    name: name.value,
    tagline: tagline.value,
    summary: summary.value,
    selectedSupplier: workspace.data.value,
  }))

  const fields = computed(() => ({
    name: name.value,
    tagline: tagline.value,
    summary: summary.value,
    imageUrl: imageUrl.value,
  }))
  const status = computed(() =>
    workspace.outcome.value === 'ready'
      ? businessId.value
        ? linkedPlace.outcome.value
        : 'empty'
      : workspace.outcome.value
  )
  const state = useWorkspaceIdentity({
    id: workspace.id,
    fields,
    status,
    canWrite: computed(() =>
      Boolean(
        currentUser.value &&
          access.outcome.value === 'ready' &&
          access.ids.value.includes(workspace.id.value) &&
          workspace.data.value?.id === workspace.id.value
      )
    ),
  })

  return {
    ...state,
    fields,
    businessId,
    placeOutcome: linkedPlace.outcome,
    place: businessPlace,
    selectedSupplier: workspace.data,
    supplierId: workspace.id,
    name,
    tagline,
    summary,
    imageUrl,
    debug,
  }
}

export type SupplierWorkspaceIdentityState = ReturnType<
  typeof useSupplierWorkspaceIdentity
>
