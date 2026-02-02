import { computed, type ComputedRef } from 'vue'
import type { Place } from '../../../../../../../models/objects/place.model'

type CollectionEntryWithId = { id: string }

const toByIdMap = (places: Place[]) => {
  const map = new Map<string, Place>()
  for (const place of places) {
    const id = String(place?.id ?? '').trim()
    if (id) map.set(id, place)
  }
  return map
}

export function hydratePlaceCollection<Entry extends CollectionEntryWithId, View>(
  collection: ComputedRef<Entry[]>,
  places: ComputedRef<Place[]>,
  build: (entry: Entry, place: Place | null) => View
) {
  return computed<View[]>(() => {
    const entries = collection.value ?? []
    if (!entries.length) return []

    const placeById = toByIdMap(places.value ?? [])
    return entries.map((entry) => {
      const place = placeById.get(String(entry.id)) ?? null
      return build(entry, place)
    })
  })
}

export function hydratePlaceDoc<Entry extends CollectionEntryWithId, View>(
  entry: ComputedRef<Entry | undefined>,
  place: ComputedRef<Place | undefined>,
  id: ComputedRef<string>,
  build: (entry: Entry | null, place: Place | null, id: string) => View | undefined
) {
  return computed<View | undefined>(() => {
    const docId = String(id.value ?? '').trim()
    if (!docId) return undefined

    const entryValue = entry.value ?? null
    const placeValue = place.value ?? null

    if (!entryValue && !placeValue) return undefined
    return build(entryValue, placeValue, docId)
  })
}
