import {
  collection,
  documentId,
  limit,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'

type PlaceIdInput = string | Ref<string | null | undefined>
type PlaceFetchFunction = (id: string) => Ref<Place | undefined>

export function usePlaceFetch(): { place: PlaceFetchFunction }
export function usePlaceFetch(id: PlaceIdInput): {
  place: ComputedRef<Place | null>
  pending: ComputedRef<boolean>
  fetchPlace: PlaceFetchFunction
}
export function usePlaceFetch(id?: PlaceIdInput) {
  const { firestoreFetchDoc, firestoreQuery } = useFirestoreRead()
  const resolveDb = useFirestoreResolver()
  const fetchPlace: PlaceFetchFunction = (placeId: string) =>
    firestoreFetchDoc<Place>(PlaceStorage.collection, placeId)

  if (id === undefined) return { place: fetchPlace }

  const placeId = isRef(id)
    ? computed(() => String(id.value ?? '').trim())
    : computed(() => String(id ?? '').trim())
  const placeQuery = computed<Query<Place> | null>(() => {
    if (!placeId.value) return null

    return fsq(
      collection(resolveDb(), PlaceStorage.collection),
      where(documentId(), '==', placeId.value),
      limit(1)
    ) as Query<Place>
  })
  const source = firestoreQuery<Place>(
    placeQuery,
    'place-fetch',
    PlaceStorage.collection
  )
  const place = computed<Place | null>(() => source.value?.[0] ?? null)
  const pending = computed(() => Boolean(placeId.value) && source.value === undefined)

  return {
    place,
    pending,
    fetchPlace,
  }
}
