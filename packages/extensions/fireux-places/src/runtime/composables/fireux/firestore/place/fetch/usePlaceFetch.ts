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

type PlaceLocatorInput = string | Ref<string | null | undefined>
type PlaceFetchFunction = (id: string) => Ref<Place | undefined>

const cleanLocator = (value: unknown) => String(value ?? '').trim()
const cleanSlug = (value: unknown) => cleanLocator(value).toLowerCase()

export function usePlaceFetch(): { place: PlaceFetchFunction }
export function usePlaceFetch(id: PlaceLocatorInput): {
  place: ComputedRef<Place | null>
  pending: ComputedRef<boolean>
  fetchPlace: PlaceFetchFunction
}
export function usePlaceFetch(id?: PlaceLocatorInput) {
  const { firestoreFetchDoc, firestoreQuery } = useFirestoreRead()
  const resolveDb = useFirestoreResolver()
  const fetchPlace: PlaceFetchFunction = (placeId: string) =>
    firestoreFetchDoc<Place>(PlaceStorage.collection, placeId)

  if (id === undefined) return { place: fetchPlace }

  const placeLocator = isRef(id)
    ? computed(() => cleanLocator(id.value))
    : computed(() => cleanLocator(id))
  const placeSlug = computed(() => cleanSlug(placeLocator.value))
  const placeIdQuery = computed<Query<Place> | null>(() => {
    if (!placeLocator.value) return null

    return fsq(
      collection(resolveDb(), PlaceStorage.collection),
      where(documentId(), '==', placeLocator.value),
      limit(1)
    ) as Query<Place>
  })
  const placeSlugQuery = computed<Query<Place> | null>(() => {
    if (!placeSlug.value) return null

    return fsq(
      collection(resolveDb(), PlaceStorage.collection),
      where('slug', '==', placeSlug.value),
      limit(1)
    ) as Query<Place>
  })
  const byIdSource = firestoreQuery<Place>(
    placeIdQuery,
    'place-fetch-by-id',
    PlaceStorage.collection
  )
  const bySlugSource = firestoreQuery<Place>(
    placeSlugQuery,
    'place-fetch-by-slug',
    PlaceStorage.collection
  )
  const place = computed<Place | null>(
    () => byIdSource.value?.[0] ?? bySlugSource.value?.[0] ?? null
  )
  const pending = computed(
    () =>
      Boolean(placeLocator.value) &&
      (byIdSource.value === undefined || bySlugSource.value === undefined)
  )

  return {
    place,
    pending,
    fetchPlace,
  }
}
