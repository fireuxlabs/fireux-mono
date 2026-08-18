import { useState } from '#imports'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { PublicPlaceDetailResponse } from '../models/place-public.model.ts'

const STATE_KEY = 'fireux-place-detail-projections'

export function usePlaceDetailState() {
  const projections = useState<Record<string, PublicPlaceDetailResponse>>(
    STATE_KEY,
    () => ({})
  )

  const projection = (id: MaybeRefOrGetter<string>) =>
    computed(() => projections.value[String(toValue(id) || '').trim()] || null)

  const publish = (response: PublicPlaceDetailResponse) => {
    const id = String(response.item?.id || '').trim()
    if (!id) return
    projections.value = { ...projections.value, [id]: response }
  }

  return { projection, publish }
}
