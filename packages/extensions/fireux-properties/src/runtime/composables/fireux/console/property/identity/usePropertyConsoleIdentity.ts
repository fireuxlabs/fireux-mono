import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { usePropertyConsole } from '../core/usePropertyConsole'

export function usePropertyConsoleIdentity() {
  const {
    selection,
    runtime,
    actions,
  } = usePropertyConsole()

  const identity = computed(() => selection.property.value?.identity)
  const name = computed(() =>
    normalizeString(identity.value?.name) || selection.propertyId.value
  )
  const address = computed(() =>
    [
      identity.value?.address_line,
      identity.value?.city,
      identity.value?.postcode,
      identity.value?.country,
    ].map(normalizeString).filter(Boolean).join(', ')
  )
  const imageUrl = computed(() => normalizeString(identity.value?.image_url))
  const debug = computed(() => ({
    propertyId: selection.propertyId.value,
    activePropertyAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    name: name.value,
    address: address.value,
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
    address,
    imageUrl,
    debug,
  }
}

export type PropertyConsoleIdentityState = ReturnType<
  typeof usePropertyConsoleIdentity
>
