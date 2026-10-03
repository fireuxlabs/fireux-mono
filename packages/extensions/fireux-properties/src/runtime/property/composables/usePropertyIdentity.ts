import { useIdentity } from 'fireux-core/runtime/composables/fireux/useIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { usePropertyWorkspace } from './workspace/usePropertyWorkspace'

export function usePropertyIdentity() {
  const workspace = usePropertyWorkspace()

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

  const state = useIdentity({ id: workspace.id, fields: identity, status: workspace.outcome, canWrite: computed(() => false) })

  return {
    ...state,
    selectedProperty: workspace.data,
    propertyId: workspace.id,
    name,
    placeId,
    imageUrl,
    debug,
  }
}

export type PropertyIdentityState = ReturnType<
  typeof usePropertyIdentity
>
