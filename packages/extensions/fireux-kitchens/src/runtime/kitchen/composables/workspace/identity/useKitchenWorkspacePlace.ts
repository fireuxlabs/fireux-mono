// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: resolve demo Place data through the lazy Kitchen workspace adapter.
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: expose Place-owned currency to Kitchen workspace consumers.
import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import {
  findKitchenWorkspaceDemoTarget,
  useKitchenWorkspaceDemoTargets,
} from '../core/useKitchenWorkspaceDemoTargets'
import {
  useKitchenWorkspaceIdentity,
  type KitchenWorkspaceIdentityState,
} from './useKitchenWorkspaceIdentity'

export function useKitchenWorkspacePlace(
  identity: KitchenWorkspaceIdentityState = useKitchenWorkspaceIdentity()
) {
  const isLive = computed(() => identity.dataType.value === 'live')
  const livePlaceId = computed(() =>
    isLive.value ? identity.placeId.value : ''
  )
  const live = usePlaceFetch(livePlaceId)
  const demoTargets = useKitchenWorkspaceDemoTargets(identity.isDemo)
  const demoPlace = computed<Place | null>(() => {
    if (!identity.isDemo.value) return null

    const target = findKitchenWorkspaceDemoTarget(
      demoTargets.data.value,
      identity.kitchenId.value
    )
    if (!target) return null
    return target.place
  })
  const place = computed<Place | null>(() => {
    if (identity.isDemo.value) return demoPlace.value
    if (isLive.value) return live.place.value
    return null
  })
  const pending = computed(() =>
    identity.isDemo.value
      ? demoTargets.pending.value
      : isLive.value
        ? live.pending.value
        : false
  )
  const currencyCode = computed(() => readPlaceCurrencyCode(place.value))

  return {
    ...identity,
    livePlaceId,
    place,
    pending,
    currencyCode,
  }
}
