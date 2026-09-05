import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'
import { usePropertyWorkspaceIndex } from '../index/usePropertyWorkspaceIndex'

export function usePropertyWorkspaceIdentity() {
  const workspace = usePropertyWorkspace()
  const index = usePropertyWorkspaceIndex()

  const identity = computed(() => workspace.data.value?.identity)
  const name = computed(
    () => normalizeString(identity.value?.name) || workspace.id.value
  )
  const placeId = computed(() =>
    normalizeString(workspace.data.value?.place_id)
  )
  const imageUrl = computed(() => normalizeString(identity.value?.image_url))
  const debug = computed(() => ({
    propertyId: workspace.id.value,
    name: name.value,
    placeId: placeId.value,
    imageUrl: imageUrl.value,
    selectedProperty: workspace.data.value,
  }))

  return {
    selectedProperty: workspace.data,
    propertyId: workspace.id,
    clearSelectedProperty: index.clear,
    name,
    placeId,
    imageUrl,
    debug,
  }
}

export type PropertyWorkspaceIdentityState = ReturnType<
  typeof usePropertyWorkspaceIdentity
>
