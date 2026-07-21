// Concurrent edit — 2026-07-21 14:30 CEST — Place public projection: replace raw browser root reads with bounded exact API reads.
import { useAsyncData } from '#imports'
import { computed, isRef, ref, type ComputedRef, type Ref } from 'vue'
import type {
  PublicPlaceDetailResponse,
  PublicPlaceProjection,
} from 'fireux-places/runtime/models/place-public.model'
import type { Place } from 'fireux-places/runtime/models/place.model'

type PlaceLocatorInput = string | Ref<string | null | undefined>
type PlaceFetchFunction = (id: string) => Ref<Place | undefined>
type PublicPlaceReadOutcome = 'idle' | 'pending' | 'error' | 'missing' | 'ready'
type PlaceFetchFactoryReturn = { place: PlaceFetchFunction }
type PlaceFetchDetailReturn = {
  place: ComputedRef<Place | null>
  pending: ComputedRef<boolean>
  error: Ref<unknown>
  outcome: ComputedRef<PublicPlaceReadOutcome>
  refresh: () => Promise<void>
  ready: Promise<void>
  fetchPlace: PlaceFetchFunction
}

const cleanLocator = (value: unknown) => String(value ?? '').trim()
const asPlace = (value: PublicPlaceProjection): Place => value as Place

function createPlaceFetcher(): PlaceFetchFunction {
  const cache = new Map<string, Ref<Place | undefined>>()

  return (value: string) => {
    const id = cleanLocator(value)
    const existing = cache.get(id)
    if (existing) return existing

    const place = ref<Place>()
    cache.set(id, place)
    if (!id || import.meta.server) return place

    void $fetch<PublicPlaceDetailResponse>(
      `/api/places/${encodeURIComponent(id)}`
    ).then(response => {
      place.value = response?.item ? asPlace(response.item) : undefined
    }).catch(() => {
      place.value = undefined
    })

    return place
  }
}

export function usePlaceFetch(): PlaceFetchFactoryReturn
export function usePlaceFetch(id: PlaceLocatorInput): PlaceFetchDetailReturn
export function usePlaceFetch(
  id?: PlaceLocatorInput
): PlaceFetchFactoryReturn | PlaceFetchDetailReturn {
  const fetchPlace = createPlaceFetcher()
  if (id === undefined) return { place: fetchPlace }

  const locator = isRef(id)
    ? computed(() => cleanLocator(id.value))
    : computed(() => cleanLocator(id))
  const state = useAsyncData<PublicPlaceDetailResponse | null>(
    () => `public-place-detail|${locator.value || 'none'}`,
    async () => {
      if (!locator.value) return null
      return $fetch<PublicPlaceDetailResponse>(
        `/api/places/${encodeURIComponent(locator.value)}`
      )
    },
    { server: true, watch: [locator] }
  )
  const place = computed<Place | null>(() =>
    state.data.value?.item ? asPlace(state.data.value.item) : null
  )
  const pending = computed(() => state.pending.value)
  const outcome = computed<PublicPlaceReadOutcome>(() => {
    if (!locator.value) return 'idle'
    if (state.pending.value) return 'pending'
    if (state.error.value) return 'error'
    return place.value ? 'ready' : 'missing'
  })

  return {
    place,
    pending,
    error: state.error as Ref<unknown>,
    outcome,
    refresh: async () => {
      await state.refresh()
    },
    ready: state.then(() => undefined),
    fetchPlace,
  }
}
