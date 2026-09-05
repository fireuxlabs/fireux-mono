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
  const currencyCode = computed(() => readPlaceCurrencyCode(placeState.place.value))

  return {
    ...identity,
    placeId,
    place: placeState.place,
    pending: placeState.pending,
    currencyCode,
  }
}
