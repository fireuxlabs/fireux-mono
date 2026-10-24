import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'

export function useKitchenPlace(kitchenId: MaybeRefOrGetter<string>) {
  const placeId = computed(() => String(toValue(kitchenId) || '').trim())
  const placeState = usePlaceFetch(placeId)
  const place = computed(() =>
    placeState.outcome.value === 'ready' &&
    placeState.place.value?.id === placeId.value
      ? placeState.place.value
      : null
  )
  const currencyCode = computed(() => readPlaceCurrencyCode(place.value))

  return {
    placeId,
    place,
    pending: placeState.pending,
    placeOutcome: placeState.outcome,
    currencyCode,
  }
}
