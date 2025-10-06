import { computed } from 'vue'
import type { Place, PlaceCard } from '../models/place.model'

const PLACE_ICON_FALLBACK =
  'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png'

export function usePlacesSaved(collectionName = 'places') {
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const rawPlaces = firestoreFetchCollection<Place>(collectionName)

  const savedPlaces = computed<Place[]>(() => {
    const raw = rawPlaces.value
    if (!raw) return []
    return raw
      .filter((doc: any) => !doc?.appId || doc.appId === appId)
      .map(
        (doc): Place => ({
          ...doc,
          source: 'firestore',
          avatar: doc.avatar || PLACE_ICON_FALLBACK,
        })
      )
      .filter((item): item is Place & { id: string } => Boolean(item.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  const savedPlacesMap = computed(() => {
    const map = new Map<string, Place>()
    for (const entry of savedPlaces.value) map.set(entry.id, entry)
    return map
  })

  const toCell = (place: Place, meta = 'Saved'): PlaceCard.Cell => ({
    id: place.id,
    name: place.name,
    avatar: place.avatar || PLACE_ICON_FALLBACK,
    formatted_address: place.formatted_address,
    rating: place.rating ?? null,
    meta_right: meta,
  })

  const savedPlaceCells = computed<PlaceCard.Cell[]>(() =>
    savedPlaces.value.map((place) => toCell(place))
  )

  const savedPlacesLoading = computed(() => rawPlaces.value === undefined)

  return {
    savedPlaces,
    savedPlacesMap,
    savedPlaceCells,
    savedPlacesLoading,
    toPlaceCell: toCell,
  }
}
