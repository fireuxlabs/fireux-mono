import { useState } from '#imports'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { PlaceDetailResponse } from '../models/place-read.model.ts'

const STATE_KEY = 'fireux-place-details'

export function usePlaceDetailState() {
  const entries = useState<Record<string, PlaceDetailResponse>>(
    STATE_KEY,
    () => ({})
  )

  const entry = (id: MaybeRefOrGetter<string>) =>
    computed(() => entries.value[String(toValue(id) || '').trim()] || null)

  const publish = (response: PlaceDetailResponse) => {
    const id = String(response.place?.id || '').trim()
    if (!id) return
    entries.value = { ...entries.value, [id]: response }
  }

  return { entry, publish }
}
