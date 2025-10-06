import { computed, onBeforeUnmount, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import type { Place, PlaceCard } from '../models/place.model'
import { usePlacesSaved } from './usePlacesSaved'

const PLACE_ICON_FALLBACK =
  'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png'
const MIN_PLACES_QUERY_LENGTH = 3

interface UsePlacesSearchControllerOptions {
  collectionName?: string
}

export function usePlacesSearchController(
  options: UsePlacesSearchControllerOptions = {}
) {
  const collectionName = options.collectionName ?? 'places'

  const query = ref('')
  const suggestions = ref<PlaceCard.Cell[]>([])
  const selectedPlace = ref<Place | null>(null)
  const localLoading = ref(false)
  const localError = ref<string | null>(null)
  let debounce: ReturnType<typeof setTimeout> | null = null

  const {
    savedPlaces,
    savedPlacesMap,
    savedPlaceCells,
    savedPlacesLoading,
    toPlaceCell,
  } = usePlacesSaved(collectionName)

  const {
    searchPlaces,
    getPlaceDetails,
    resetSessionToken,
    isLoading: googleLoading,
    error: googleError,
  } = useGooglePlaces()

  const { setDocument } = useFirestoreManager()
  const { appId } = useFireUXConfig()

  const normalizedQuery = computed(() => query.value.trim().toLowerCase())
  const queryHasMinLength = computed(
    () => normalizedQuery.value.length >= MIN_PLACES_QUERY_LENGTH
  )

  const visibleSavedPlaceCells = computed<PlaceCard.Cell[]>(() => {
    if (!queryHasMinLength.value) return savedPlaceCells.value
    return savedPlaceCells.value.filter((cell) => {
      const name = (cell.name || '').toLowerCase()
      const address = (cell.formatted_address || '').toLowerCase()
      return (
        name.includes(normalizedQuery.value) ||
        address.includes(normalizedQuery.value)
      )
    })
  })

  const hasSavedMatchForQuery = computed(
    () => queryHasMinLength.value && visibleSavedPlaceCells.value.length > 0
  )

  const savedSectionLabel = computed(() =>
    queryHasMinLength.value ? 'Saved matches' : 'Saved places'
  )

  const savedBadgeCount = computed(() =>
    queryHasMinLength.value
      ? visibleSavedPlaceCells.value.length
      : savedPlaceCells.value.length
  )

  const selectedPlaceCell = computed<PlaceCard.Cell | null>(() => {
    if (!selectedPlace.value) return null
    const meta = selectedPlace.value.source === 'firestore' ? 'Saved' : 'Google'
    return toPlaceCell(selectedPlace.value, meta)
  })

  const isLoading = computed(() => googleLoading.value || localLoading.value)
  const errorMessage = computed(() => localError.value || googleError.value)

  function getApiKey(): string {
    const config = useRuntimeConfig()
    const firebaseApiKey = (config.public as any)?.firebaseConfig?.apiKey
    return (
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      (firebaseApiKey as string | undefined) ||
      ''
    )
  }

  function clearDebounce() {
    if (debounce) {
      clearTimeout(debounce)
      debounce = null
    }
  }

  function onInput() {
    localError.value = null
    selectedPlace.value = null
    clearDebounce()

    if (!queryHasMinLength.value) {
      suggestions.value = []
      resetSessionToken()
      return
    }

    debounce = setTimeout(runAutocomplete, 250)
  }

  async function runAutocomplete() {
    localLoading.value = true
    try {
      if (hasSavedMatchForQuery.value) {
        suggestions.value = []
        return
      }
      const term = query.value.trim()
      const results = await searchPlaces(term, getApiKey())
      suggestions.value = results.slice(0, 6)
    } catch (e: any) {
      localError.value = e?.message ?? 'Search failed'
      suggestions.value = []
    } finally {
      localLoading.value = false
    }
  }

  async function savePlaceToFirestore(place: Place) {
    const payload: Record<string, any> = {
      id: place.id,
      name: place.name,
      formatted_address: place.formatted_address,
      lat: place.lat,
      lng: place.lng,
      avatar: place.avatar,
      website: place.website ?? null,
      phone: place.phone ?? null,
      rating: place.rating ?? null,
      user_ratings_total: place.user_ratings_total ?? null,
      source: 'firestore',
    }

    if (appId) {
      payload.appId = appId
    }

    await setDocument(collectionName, place.id, payload)
  }

  async function selectSuggestion(cell: PlaceCard.Cell) {
    try {
      localLoading.value = true
      localError.value = null
      const details = await getPlaceDetails(cell.id, getApiKey())
      const resolvedId = details.id || cell.id
      const existing = savedPlacesMap.value.get(resolvedId)
      if (existing) {
        selectedPlace.value = existing
        suggestions.value = []
        query.value = existing.name
        return
      }

      const googlePlace: Place = {
        ...details,
        id: resolvedId,
        avatar: details.avatar || PLACE_ICON_FALLBACK,
        source: 'google',
        created_at: details.created_at ?? null,
        updated_at: details.updated_at ?? null,
      }
      selectedPlace.value = googlePlace
      suggestions.value = []
      query.value = googlePlace.name

      const placeToPersist: Place = {
        ...googlePlace,
        source: 'firestore',
      }

      await savePlaceToFirestore(placeToPersist)
      selectedPlace.value = placeToPersist
    } catch (e: any) {
      localError.value = e?.message ?? 'Failed to load details'
    } finally {
      localLoading.value = false
    }
  }

  function selectSaved(cell: PlaceCard.Cell) {
    const match = savedPlacesMap.value.get(cell.id)
    selectedPlace.value = match ?? null
    if (match) query.value = match.name
  }

  function clearSelection() {
    selectedPlace.value = null
    localError.value = null
  }

  function clearSuggestions() {
    suggestions.value = []
    resetSessionToken()
  }

  function clearAll() {
    query.value = ''
    clearSelection()
    clearSuggestions()
  }

  onBeforeUnmount(() => {
    clearDebounce()
  })

  return {
    query,
    suggestions,
    selectedPlace,
    selectedPlaceCell,
    savedPlaces,
    savedPlaceCells,
    visibleSavedPlaceCells,
    savedPlacesLoading,
    savedSectionLabel,
    savedBadgeCount,
    queryHasMinLength,
    hasSavedMatchForQuery,
    isLoading,
    errorMessage,
    onInput,
    selectSuggestion,
    selectSaved,
    clearSelection,
    clearSuggestions,
    clearAll,
  }
}
