// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: resolve demo Place data through the lazy Kitchen console adapter.
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: expose Place-owned currency to Kitchen console consumers.
import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/usePlaceFetch'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/utils/place-spine'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'
import {
  findKitchenConsoleDemoTarget,
  useKitchenConsoleDemoTargets,
} from '../core/useKitchenConsoleDemoTargets'
import {
  useKitchenConsoleIdentity,
  type KitchenConsoleIdentityState,
} from './useKitchenConsoleIdentity'

export function useKitchenConsolePlace(
  identity: KitchenConsoleIdentityState = useKitchenConsoleIdentity()
) {
  const isLive = computed(() => identity.dataType.value === 'live')
  const livePlaceId = computed(() =>
    isLive.value ? identity.placeId.value : ''
  )
  const live = usePlaceFetch(livePlaceId)
  const demoTargets = useKitchenConsoleDemoTargets(identity.isDemo)
  const demoPlace = computed<Place | null>(() => {
    if (!identity.isDemo.value) return null

    const target = findKitchenConsoleDemoTarget(
      demoTargets.data.value,
      identity.kitchenId.value
    )
    if (!target) return null
    const place = target.place

    const kitchen = identity.selectedKitchen.value as Record<string, unknown> | null
    const kitchenIdentity = readKitchenIdentity(kitchen)

    return {
      ...place,
      name: kitchenIdentity.displayName || place.short_name,
      image_url: kitchenIdentity.imageUrl,
      cover_image: String(kitchen?.cover_image ?? '').trim(),
      image_shade: kitchenIdentity.imageShade,
    } as Place
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
