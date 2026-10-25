import { useSupplierAccess } from '../useSupplierAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { useWorkspaceIdentity } from 'fireux-core/runtime/workspace/composables/useWorkspaceIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useSupplierWorkspace } from './useSupplierWorkspace'

export function useSupplierWorkspaceIdentity() {
  const workspace = useSupplierWorkspace()
  const access = useSupplierAccess()
  const { currentUser } = useAuth()
  const companyId = computed(() =>
    normalizeString(workspace.data.value?.company_id)
  )
  const linkedPlace = usePlaceFetch(companyId)
  const companyPlace = computed(() =>
    linkedPlace.place.value?.id === companyId.value
      ? linkedPlace.place.value
      : null
  )

  const name = computed(() =>
    normalizeString(companyPlace.value?.short_name || companyPlace.value?.name)
  )
  const tagline = computed(() => normalizeString(companyPlace.value?.tagline))
  const summary = computed(() => normalizeString(companyPlace.value?.about))
  const imageUrl = computed(() =>
    normalizeString(
      companyPlace.value?.logo_image || companyPlace.value?.image_url
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
      ? companyId.value
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
    companyId,
    placeOutcome: linkedPlace.outcome,
    place: companyPlace,
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
