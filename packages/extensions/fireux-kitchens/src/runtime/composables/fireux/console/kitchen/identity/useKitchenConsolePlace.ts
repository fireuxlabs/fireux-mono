import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/usePlaceFetch'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { getDemoKitchenPlace } from '../../../demo/kitchen/scenarios'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'
import { useKitchenConsoleIdentity } from './useKitchenConsoleIdentity'

export function useKitchenConsolePlace() {
  const identity = useKitchenConsoleIdentity()
  const livePlaceId = computed(() =>
    identity.source.value === 'live' ? identity.placeId.value : ''
  )
  const live = usePlaceFetch(livePlaceId)
  const demoPlace = computed<Place | null>(() => {
    if (identity.source.value !== 'demo') return null

    const place = getDemoKitchenPlace(identity.kitchenId.value)
    if (!place) return null

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
    identity.source.value === 'live' ? live.pending.value : false
  )

  return {
    ...identity,
    livePlaceId,
    place,
    pending,
  }
}
