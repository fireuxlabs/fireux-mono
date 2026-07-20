// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: resolve demo Place data through the lazy Kitchen console adapter.
// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: expose Place-owned currency to Kitchen console consumers.
import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/usePlaceFetch'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/utils/place-spine'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../core/useKitchenConsoleDemoData'
import { useKitchenConsoleIdentity } from './useKitchenConsoleIdentity'

export function useKitchenConsolePlace() {
  const identity = useKitchenConsoleIdentity()
  const livePlaceId = computed(() =>
    identity.source.value === 'live' ? identity.placeId.value : ''
  )
  const live = usePlaceFetch(livePlaceId)
  const demoData = useKitchenConsoleDemoData(
    computed(() => identity.source.value === 'demo')
  )
  const demoPlace = computed<Place | null>(() => {
    if (identity.source.value !== 'demo') return null

    const scenario = findKitchenConsoleDemoScenario(
      demoData.data.value,
      identity.kitchenId.value
    )
    if (!scenario) return null
    const place = scenario.place

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
    if (identity.source.value === 'demo') return demoPlace.value
    if (identity.source.value === 'live') return live.place.value
    return null
  })
  const pending = computed(() =>
    identity.source.value === 'demo'
      ? demoData.pending.value
      : identity.source.value === 'live'
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
