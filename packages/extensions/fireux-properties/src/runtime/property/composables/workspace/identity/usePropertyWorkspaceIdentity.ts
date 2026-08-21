// Concurrent edit — 2026-07-20 22:21 CEST — Both-Entity Authority — Property: expose the canonical Place reference instead of copied address truth.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'

export function usePropertyWorkspaceIdentity() {
  const { selection, runtime, actions } = usePropertyWorkspace()

  const identity = computed(() => selection.property.value?.identity)
  const name = computed(
    () => normalizeString(identity.value?.name) || selection.propertyId.value
  )
  const placeId = computed(() =>
    normalizeString(selection.property.value?.place_id)
  )
  const imageUrl = computed(() => normalizeString(identity.value?.image_url))
  const debug = computed(() => ({
    propertyId: selection.propertyId.value,
    activePropertyAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    name: name.value,
    placeId: placeId.value,
    imageUrl: imageUrl.value,
    selectedProperty: selection.property.value,
  }))

  return {
    selectedProperty: selection.property,
    propertyId: selection.propertyId,
    activePropertyAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedProperty: actions.clearSelectedProperty,
    name,
    placeId,
    imageUrl,
    debug,
  }
}

export type PropertyWorkspaceIdentityState = ReturnType<
  typeof usePropertyWorkspaceIdentity
>
