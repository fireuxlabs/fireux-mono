import { computed, type Ref } from 'vue'
import type { BasePlace } from '../../../../../../models/place.model'

export function usePlaceComputed(
  place?: Ref<BasePlace | null | undefined>
) {
  const hasPlace = computed(() => Boolean(place?.value?.id))
  const placeTitle = computed(() =>
    String(place?.value?.name || place?.value?.id || '').trim()
  )
  const placeSubtitle = computed(() =>
    String(
      place?.value?.short_address ||
        place?.value?.formatted_address ||
        ''
    ).trim()
  )

  return {
    hasPlace,
    placeTitle,
    placeSubtitle,
  }
}
