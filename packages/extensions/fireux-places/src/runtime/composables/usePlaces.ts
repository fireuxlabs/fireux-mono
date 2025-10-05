import { computed, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useGooglePlaces } from './useGooglePlaces'
import type { Place, PlaceCard } from '../models/place.model'

interface SimpleAddress {
  street?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
}

export function usePlaces() {
  const selectedPlace = ref<Place | null>(null)
  const error = ref<string | null>(null)
  const localLoading = ref(false)

  const {
    searchPlaces: googleSearchPlaces,
    getPlaceDetails: googleGetPlaceDetails,
    resetSessionToken,
    isLoading: googleLoading,
    error: googleError,
  } = useGooglePlaces()

  function getApiKey(): string {
    const config = useRuntimeConfig()
    const firebaseApiKey = (config.public as any)?.firebaseConfig?.apiKey
    return (
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      (firebaseApiKey as string | undefined) ||
      ''
    )
  }

  const isLoading = computed(() => googleLoading.value || localLoading.value)
  const combinedError = computed(() => error.value || googleError.value)

  const simpleAddress = computed<SimpleAddress | null>(() => {
    if (!selectedPlace.value?.formatted_address) return null
    const parts = selectedPlace.value.formatted_address
      .split(',')
      .map((p) => p.trim())
    return {
      street: parts[0],
      city: parts[1],
      state: parts[2],
      postal_code: parts[3],
      country: parts[parts.length - 1],
    }
  })

  const formattedAddress = computed(
    () => selectedPlace.value?.formatted_address || ''
  )

  async function searchPlaces(query: string): Promise<PlaceCard.Cell[]> {
    localLoading.value = true
    try {
      return await googleSearchPlaces(query, getApiKey())
    } finally {
      localLoading.value = false
    }
  }

  async function getPlaceDetails(placeId: string): Promise<Place> {
    localLoading.value = true
    try {
      const details = await googleGetPlaceDetails(placeId, getApiKey())
      selectedPlace.value = details
      error.value = null
      return details
    } catch (e: any) {
      error.value = e?.message ?? String(e)
      throw e
    } finally {
      localLoading.value = false
    }
  }

  function setPlace(place: Place | null) {
    selectedPlace.value = place
    error.value = null
  }

  function clearPlace() {
    selectedPlace.value = null
    error.value = null
  }

  function clearSuggestions() {
    resetSessionToken()
  }

  function setError(message: string | null) {
    error.value = message
  }

  return {
    selectedPlace,
    simpleAddress,
    formattedAddress,
    isLoading,
    error: combinedError,
    searchPlaces,
    getPlaceDetails,
    setPlace,
    clearPlace,
    setError,
    clearSuggestions,
  }
}
