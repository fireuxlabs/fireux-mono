import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import {
  useKitchenWorkspaceIdentity,
  type KitchenWorkspaceIdentityState,
} from './useKitchenWorkspaceIdentity'

export function useKitchenWorkspacePlace(
  identity: KitchenWorkspaceIdentityState = useKitchenWorkspaceIdentity()
) {
  const placeId = computed(() => identity.kitchenId.value)
  const placeState = usePlaceFetch(placeId)
  const place = computed(() =>
    identity.outcome.value === 'ready' &&
    placeState.outcome.value === 'ready' &&
    placeState.place.value?.id === placeId.value
      ? placeState.place.value
      : null
  )
  const currencyCode = computed(() => readPlaceCurrencyCode(place.value))

  return {
    ...identity,
    placeId,
    place,
    pending: placeState.pending,
    placeOutcome: placeState.outcome,
    currencyCode,
  }
}
