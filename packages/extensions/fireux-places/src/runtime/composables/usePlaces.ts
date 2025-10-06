import { computed, onBeforeUnmount, ref } from 'vue'
import { useRequestURL } from '#app'
import { useFirestore, useCollection } from 'vuefire'
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFireUXConfig } from '#imports'
import type { Place, PlaceCard } from '../models/place.model'

const MIN_PLACES_QUERY_LENGTH = 3

interface AutocompletePrediction {
  place_id: string
  description?: string
  structured_formatting?: {
    main_text?: string
    secondary_text?: string
  }
  name?: string
}

interface PlaceDetailsResponse {
  result: {
    place_id: string
    name?: string
    formatted_address?: string
    website?: string
    international_phone_number?: string
    formatted_phone_number?: string
    rating?: number
    user_ratings_total?: number
    geometry?: {
      location?: {
        lat?: number
        lng?: number
      }
    }
    photos?: Array<{
      photo_reference: string
      width?: number
    }>
  } | null
}

function resolveBaseOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin
  const url = useRequestURL()
  return url?.origin || ''
}

async function fetchJson<T>(input: string): Promise<T> {
  const response = await fetch(input)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return (await response.json()) as T
}

type PlacePhoto = { photo_reference: string; width?: number }

function normalizeWebsiteUrl(website?: string | null): URL | null {
  if (!website) return null
  try {
    return new URL(website.startsWith('http') ? website : `https://${website}`)
  } catch {
    return null
  }
}

async function fetchBusinessLogo(
  baseOrigin: string,
  websiteUrl: URL
): Promise<string | null> {
  try {
    const logoUrl = new URL('/api/places/logo', baseOrigin)
    logoUrl.searchParams.set('website', websiteUrl.toString())
    const logoRes = await fetch(logoUrl.toString())
    if (!logoRes.ok) return null
    const { url } = (await logoRes.json()) as { url?: string }
    return typeof url === 'string' && url ? url : null
  } catch {
    return null
  }
}

function buildFaviconUrl(websiteUrl: URL): string {
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(
    websiteUrl.origin
  )}`
}

function buildPhotoUrl(
  baseOrigin: string,
  photo?: PlacePhoto | null
): string | null {
  if (!photo?.photo_reference) return null
  const photoUrl = new URL('/api/places/photo', baseOrigin)
  photoUrl.searchParams.set('ref', photo.photo_reference)
  const max = Math.min(photo.width ?? 400, 400)
  photoUrl.searchParams.set('maxwidth', String(max))
  return photoUrl.toString()
}

async function resolveAvatar(
  baseOrigin: string,
  options: { website?: string | null; photos?: PlacePhoto[] } = {}
): Promise<string> {
  const websiteUrl = normalizeWebsiteUrl(options.website)
  if (websiteUrl) {
    const logo = await fetchBusinessLogo(baseOrigin, websiteUrl)
    if (logo) return logo
    return buildFaviconUrl(websiteUrl)
  }

  const photoUrl = buildPhotoUrl(baseOrigin, options.photos?.[0] ?? null)
  return photoUrl || ''
}

export function usePlaces() {
  const baseOrigin = resolveBaseOrigin()

  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && Boolean(appId)

  const db = useFirestore()
  const collectionPath = isTenant && appId ? `apps/${appId}/places` : 'places'
  const collectionRef = collection(db, collectionPath)
  const { data: savedPlacesData } = useCollection<Place>(collectionRef)

  const savedPlacesMap = computed(() => {
    const map = new Map<string, Place>()
    for (const entry of savedPlacesData.value || []) {
      map.set(entry.id, entry)
    }
    return map
  })

  const savedPlaceCells = computed<PlaceCard.Cell[]>(() =>
    (savedPlacesData.value || [])
      .map((place) => ({
        id: place.id,
        name: place.name,
        avatar: place.avatar || null,
        formatted_address: place.formatted_address,
        rating: place.rating ?? null,
        meta_right: 'Saved',
        source: 'firestore' as const,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  )

  const savedPlacesLoading = computed(() => savedPlacesData.value === undefined)

  const query = ref('')
  const suggestions = ref<PlaceCard.Cell[]>([])
  const selectedPlace = ref<Place | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  let debounce: ReturnType<typeof setTimeout> | null = null

  const normalizedQuery = computed(() => query.value.trim().toLowerCase())
  const queryHasMinLength = computed(
    () => normalizedQuery.value.length >= MIN_PLACES_QUERY_LENGTH
  )

  const visibleSavedPlaceCells = computed(() => {
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

  const savedBadgeCount = computed(() =>
    queryHasMinLength.value
      ? visibleSavedPlaceCells.value.length
      : savedPlaceCells.value.length
  )

  const savedSectionLabel = computed(() =>
    queryHasMinLength.value ? 'Saved matches' : 'Saved places'
  )

  const hasSavedMatchForQuery = computed(
    () => queryHasMinLength.value && visibleSavedPlaceCells.value.length > 0
  )

  const selectedPlaceCell = computed<PlaceCard.Cell | null>(() => {
    if (!selectedPlace.value) return null
    return {
      id: selectedPlace.value.id,
      name: selectedPlace.value.name,
      avatar: selectedPlace.value.avatar || null,
      formatted_address: selectedPlace.value.formatted_address,
      rating: selectedPlace.value.rating ?? null,
      meta_right:
        selectedPlace.value.source === 'firestore' ? 'Saved' : 'Google',
      source: selectedPlace.value.source,
    }
  })

  function clearDebounce() {
    if (debounce) {
      clearTimeout(debounce)
      debounce = null
    }
  }

  async function runAutocomplete() {
    if (!queryHasMinLength.value) return
    if (hasSavedMatchForQuery.value) {
      suggestions.value = []
      return
    }

    try {
      isLoading.value = true
      const autocompleteUrl = new URL('/api/places/autocomplete', baseOrigin)
      autocompleteUrl.searchParams.set('q', query.value.trim())
      const data = await fetchJson<{ predictions: AutocompletePrediction[] }>(
        autocompleteUrl.toString()
      )

      const mapped: PlaceCard.Cell[] = []
      for (const prediction of data.predictions || []) {
        const id = prediction.place_id
        const existing = savedPlacesMap.value.get(id)
        if (existing) {
          mapped.push({
            id: existing.id,
            name: existing.name,
            avatar: existing.avatar || null,
            formatted_address: existing.formatted_address,
            rating: existing.rating ?? null,
            meta_right: 'Saved',
            source: 'firestore',
          })
          continue
        }

        const name =
          prediction.name ||
          prediction.structured_formatting?.main_text ||
          prediction.description?.split(',')[0] ||
          'Unknown place'
        const formatted_address =
          prediction.structured_formatting?.secondary_text ||
          prediction.description ||
          ''

        mapped.push({
          id,
          name,
          formatted_address,
          avatar: null,
          rating: null,
          meta_right: 'Google',
          source: 'google',
        })
      }

      suggestions.value = mapped.slice(0, 6)
    } catch (error: any) {
      errorMessage.value = error?.message || 'Search failed'
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }

  function onInput() {
    errorMessage.value = null
    selectedPlace.value = null
    clearDebounce()

    if (!queryHasMinLength.value) {
      suggestions.value = []
      return
    }

    debounce = setTimeout(() => {
      void runAutocomplete()
    }, 250)
  }

  async function fetchPlaceDetails(placeId: string): Promise<Place> {
    const detailsUrl = new URL('/api/places/details', baseOrigin)
    detailsUrl.searchParams.set('place_id', placeId)
    const data = await fetchJson<PlaceDetailsResponse>(detailsUrl.toString())
    const result = data.result
    if (!result) throw new Error('Place details not found')

    const lat = result.geometry?.location?.lat ?? 0
    const lng = result.geometry?.location?.lng ?? 0
    const avatar = await resolveAvatar(baseOrigin, {
      website: result.website,
      photos: result.photos,
    })

    return {
      id: result.place_id,
      name: result.name || 'Unknown place',
      formatted_address: result.formatted_address || '',
      lat,
      lng,
      avatar,
      source: 'google',
      website: result.website || null,
      phone:
        result.international_phone_number ||
        result.formatted_phone_number ||
        null,
      rating: typeof result.rating === 'number' ? result.rating : null,
      user_ratings_total: result.user_ratings_total ?? null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }
  }

  async function savePlace(place: Place) {
    const payload: Place = {
      ...place,
      source: 'firestore',
      avatar: place.avatar || '',
      created_at: place.created_at ?? serverTimestamp(),
      updated_at: serverTimestamp(),
    }

    await setDoc(doc(db, collectionPath, place.id), payload, { merge: true })

    selectedPlace.value = {
      ...payload,
      source: 'firestore',
    }

    return selectedPlace.value
  }

  async function selectSuggestion(cell: PlaceCard.Cell) {
    if (cell.source === 'firestore') {
      await selectSaved(cell)
      return
    }

    try {
      isLoading.value = true
      errorMessage.value = null
      const details = await fetchPlaceDetails(cell.id)
      const persisted = await savePlace(details)
      query.value = persisted.name
      suggestions.value = []
      await runAutocomplete()
    } catch (error: any) {
      errorMessage.value = error?.message || 'Failed to load details'
    } finally {
      isLoading.value = false
    }
  }

  async function selectSaved(cell: PlaceCard.Cell) {
    const existing = savedPlacesMap.value.get(cell.id)
    if (existing) {
      selectedPlace.value = existing
      query.value = existing.name
      return
    }
    query.value = cell.name
    selectedPlace.value = null
  }

  function clearSelection() {
    selectedPlace.value = null
  }

  function reset() {
    clearDebounce()
    query.value = ''
    suggestions.value = []
    errorMessage.value = null
    selectedPlace.value = null
  }

  onBeforeUnmount(() => {
    clearDebounce()
  })

  return {
    query,
    suggestions,
    selectedPlace,
    selectedPlaceCell,
    savedPlacesLoading,
    savedSectionLabel,
    savedBadgeCount,
    visibleSavedPlaceCells,
    queryHasMinLength,
    isLoading,
    errorMessage,
    onInput,
    selectSuggestion,
    selectSaved,
    clearSelection,
    reset,
  }
}
