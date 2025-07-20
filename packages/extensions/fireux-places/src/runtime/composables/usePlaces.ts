import { ref, computed } from 'vue'
import type {
  Place,
  SimpleAddress,
  PlaceAutocompleteResult,
} from '../models/place.model'

export function usePlaces() {
  const selectedPlace = ref<Place | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const simpleAddress = computed<SimpleAddress>(() => {
    if (!selectedPlace.value) return {}

    const components = selectedPlace.value.address_components
    return {
      street:
        getAddressComponent(components, 'street_number') +
        ' ' +
        getAddressComponent(components, 'route'),
      city: getAddressComponent(components, 'locality'),
      state: getAddressComponent(components, 'administrative_area_level_1'),
      country: getAddressComponent(components, 'country'),
      postal_code: getAddressComponent(components, 'postal_code'),
    }
  })

  const formattedAddress = computed(() => {
    return selectedPlace.value?.formatted_address || ''
  })

  // Methods
  function getAddressComponent(components: any[], type: string): string {
    const component = components.find((c) => c.types.includes(type))
    return component?.long_name || ''
  }

  function setPlace(place: Place) {
    selectedPlace.value = place
    error.value = null
  }

  function clearPlace() {
    selectedPlace.value = null
    error.value = null
  }

  function setError(message: string) {
    error.value = message
    isLoading.value = false
  }

  return {
    // State
    selectedPlace,
    isLoading,
    error,

    // Computed
    simpleAddress,
    formattedAddress,

    // Methods
    setPlace,
    clearPlace,
    setError,
  }
}
