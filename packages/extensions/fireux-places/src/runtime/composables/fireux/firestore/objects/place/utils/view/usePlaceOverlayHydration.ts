import { computed, type ComputedRef } from 'vue'
import type { Place } from '../../../../../../../models/objects/place.model'

type OverlayWithId = { id: string }

const toByIdMap = (places: Place[]) => {
  const map = new Map<string, Place>()
  for (const place of places) {
    const id = String(place?.id ?? '').trim()
    if (id) map.set(id, place)
  }
  return map
}

export function hydratePlaceOverlayCollection<Overlay extends OverlayWithId, View>(
  overlays: ComputedRef<Overlay[]>,
  places: ComputedRef<Place[]>,
  build: (overlay: Overlay, place: Place | null) => View
) {
  return computed<View[]>(() => {
    const overlayList = overlays.value ?? []
    if (!overlayList.length) return []

    const placeById = toByIdMap(places.value ?? [])
    return overlayList.map((overlay) => {
      const place = placeById.get(String(overlay.id)) ?? null
      return build(overlay, place)
    })
  })
}

export function hydratePlaceOverlayDoc<Overlay extends OverlayWithId, View>(
  overlay: ComputedRef<Overlay | undefined>,
  place: ComputedRef<Place | undefined>,
  id: ComputedRef<string>,
  build: (overlay: Overlay | null, place: Place | null, id: string) => View | undefined
) {
  return computed<View | undefined>(() => {
    const docId = String(id.value ?? '').trim()
    if (!docId) return undefined

    const overlayValue = overlay.value ?? null
    const placeValue = place.value ?? null

    if (!overlayValue && !placeValue) return undefined
    return build(overlayValue, placeValue, docId)
  })
}
