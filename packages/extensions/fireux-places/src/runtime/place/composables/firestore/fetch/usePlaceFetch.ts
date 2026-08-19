import { useAsyncData } from '#imports'
import { computed, isRef, ref, type ComputedRef, type Ref } from 'vue'
import type { PlaceDetailResponse } from '../../../models/place-read.model.ts'
import type { Place } from '../../../models/place.model.ts'
import { usePlaceDetailState } from '../../usePlaceDetailState'

type PlaceLocatorInput = string | Ref<string | null | undefined>
type PlaceFetchFunction = (id: string) => Ref<Place | undefined>
type PlaceReadOutcome = 'idle' | 'pending' | 'error' | 'missing' | 'ready'
type PlaceFetchFactoryReturn = { place: PlaceFetchFunction }
type PlaceFetchDetailReturn = {
  place: ComputedRef<Place | null>
  pending: ComputedRef<boolean>
  error: Ref<unknown>
  outcome: ComputedRef<PlaceReadOutcome>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  refresh: () => Promise<void>
  ready: Promise<void>
  fetchPlace: PlaceFetchFunction
}

const cleanLocator = (value: unknown) => String(value ?? '').trim()
const readStatusCode = (value: unknown) => {
  if (!value || typeof value !== 'object') return 0
  const error = value as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  return Number(error.statusCode ?? error.status ?? error.response?.status ?? 0)
}

function createPlaceFetcher(): PlaceFetchFunction {
  const cache = new Map<string, Ref<Place | undefined>>()

  return (value: string) => {
    const id = cleanLocator(value)
    const existing = cache.get(id)
    if (existing) return existing

    const place = ref<Place>()
    cache.set(id, place)
    if (!id || import.meta.server) return place

    void $fetch<PlaceDetailResponse>(`/api/places/${encodeURIComponent(id)}`)
      .then((response) => {
        place.value = response?.place
      })
      .catch(() => {
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
  const state = useAsyncData<PlaceDetailResponse | null>(
    () => `place-detail|${locator.value || 'none'}`,
    async () => {
      if (!locator.value) return null
      return $fetch<PlaceDetailResponse>(
        `/api/places/${encodeURIComponent(locator.value)}`
      )
    },
    { server: true, watch: [locator] }
  )
  const { entry } = usePlaceDetailState()
  const localEntry = entry(locator)
  const place = computed<Place | null>(
    () => localEntry.value?.place || state.data.value?.place || null
  )
  const pending = computed(() => state.pending.value)
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !place.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<PlaceReadOutcome>(() => {
    if (!locator.value) return 'idle'
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    return missing.value ? 'missing' : 'ready'
  })

  return {
    place,
    pending,
    error: state.error as Ref<unknown>,
    outcome,
    statusCode,
    missing,
    failed,
    refresh: async () => {
      await state.refresh()
    },
    ready: state.then(() => undefined),
    fetchPlace,
  }
}
