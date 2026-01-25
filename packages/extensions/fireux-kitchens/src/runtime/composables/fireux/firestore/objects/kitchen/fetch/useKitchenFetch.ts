import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'
import { computed } from 'vue'
import type { Kitchen, KitchenOverlay } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

/**
 * Canon fetch helpers for Kitchen (collection + single doc).
 * Canon: overlay collection `kitchens/{placeId}`.
 */
export function useKitchenFetch() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const source = firestoreFetchCollection<KitchenOverlay>(COLLECTION_PATH)
  const placesSource = firestoreFetchCollection<Place>('places')

  const kitchens = computed<Kitchen[]>(() => {
    const overlays = source.value ?? []
    const places = placesSource.value ?? []

    if (!overlays.length) return []

    const placeById = new Map<string, Place>()
    for (const place of places) {
      if (place?.id) placeById.set(String(place.id), place)
    }

    return overlays.map((overlay) => {
      const place = overlay?.id ? placeById.get(String(overlay.id)) : undefined
      return {
        ...place,
        ...overlay,
        id: overlay.id,
        name: place?.name || '',
        formatted_address: place?.formatted_address || '',
        lat: place?.lat ?? 0,
        lng: place?.lng ?? 0,
        place_image: place?.place_image || '',
        image_shade: place?.image_shade || 'neutral',
        website: overlay?.website || '',
      } as Kitchen
    })
  })

  const kitchen = (id: string) => {
    const kitchenDoc = firestoreFetchDoc<KitchenOverlay>(COLLECTION_PATH, id)
    const placeDoc = firestoreFetchDoc<Place>('places', id)

    return computed<Kitchen | undefined>(() => {
      const kitchenData = kitchenDoc.value
      const placeData = placeDoc.value

      if (!kitchenData && !placeData) return undefined

      const name = placeData?.name || ''
      const formatted_address = placeData?.formatted_address || ''
      const image_shade = placeData?.image_shade || 'neutral'

      return {
        ...placeData,
        ...kitchenData,
        id,
        name,
        formatted_address,
        place_image: placeData?.place_image || '',
        image_shade,
        website: kitchenData?.website || '',
      } as Kitchen
    })
  }

  return {
    kitchens,
    kitchen,
  }
}