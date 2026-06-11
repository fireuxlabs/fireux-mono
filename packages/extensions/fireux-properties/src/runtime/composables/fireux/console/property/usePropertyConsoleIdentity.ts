import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { usePropertyConsole } from './usePropertyConsole'

export function usePropertyConsoleIdentity() {
  const {
    selectedProperty,
    selectedMode,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
  } = usePropertyConsole()

  const identity = computed(() => selectedProperty.value?.identity)
  const name = computed(() =>
    normalizeString(identity.value?.name) || propertyId.value
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
    selectedMode: selectedMode.value,
    propertyId: propertyId.value,
    activePropertyAppId: activePropertyAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    address: address.value,
    imageUrl: imageUrl.value,
    selectedProperty: selectedProperty.value,
  }))

  return {
    selectedProperty,
    selectedMode,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
    name,
    address,
    imageUrl,
    debug,
  }
}

export type PropertyConsoleIdentityState = ReturnType<
  typeof usePropertyConsoleIdentity
>
