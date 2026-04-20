import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { AppKitchen, Kitchen } from '../../../../../models/kitchen.model'

type KitchenCollectionDoc = Partial<Kitchen> & { id?: string; place_id?: string }
type AppKitchenCollectionDoc = AppKitchen & { id?: string }
type KitchenCollectionScope = 'all' | 'mine'

type UseKitchenCollectionOptions = {
  collectionPath?: string | Ref<string>
  scope?: KitchenCollectionScope | Ref<KitchenCollectionScope>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'kitchens'

const pickPlaceForKitchen = (
  place: Place | null
): Partial<
  Pick<
    Place,
    | 'name'
    | 'short_name'
    | 'short_address'
    | 'formatted_address'
    | 'lat'
    | 'lng'
    | 'image_url'
    | 'image_shade'
    | 'claimed_by'
    | 'source'
    | 'slug'
  >
> => {
  if (!place) return {}
  return {
    name: place.name,
    short_name: place.short_name,
    short_address: place.short_address,
    formatted_address: place.formatted_address,
    lat: place.lat,
    lng: place.lng,
    image_url: place.image_url,
    image_shade: place.image_shade,
    claimed_by: place.claimed_by,
    source: place.source,
    slug: place.slug,
  }
}

export function useKitchenCollection(options: UseKitchenCollectionOptions = {}) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreQuery } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())
  const scopeRef = isRef(options.scope)
    ? options.scope
    : computed<KitchenCollectionScope>(() => options.scope || 'all')
  const currentUid = computed(() => String(uid.value || '').trim())
  const currentAppId = computed(() => String(appId || '').trim())
  const shouldHydrate = options.hydrate !== false

  const source = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    return firestoreFetchCollection<KitchenCollectionDoc>(collectionPath)
  })

  const overlaySource = computed(() => {
    if (scopeRef.value !== 'mine') return null

    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const memberId = currentUid.value
    const resolvedAppId = currentAppId.value

    if (!memberId || !resolvedAppId) return null

    const q = fsq(
      collection(db, 'apps', resolvedAppId, collectionPath),
      where('team_ids', 'array-contains', memberId)
    ) as Query<AppKitchenCollectionDoc>

    return firestoreQuery<AppKitchenCollectionDoc>(
      q,
      `apps-${resolvedAppId}-${collectionPath}-team-${memberId}`,
      `apps/${resolvedAppId}/${collectionPath}`
    )
  })

  const placesSource = computed(() => {
    if (!shouldHydrate) return null
    return firestoreFetchCollection<Place>('places')
  })

  const kitchens = computed(() => {
    const allowedKitchenIds =
      scopeRef.value === 'mine'
        ? new Set(
            (overlaySource.value?.value ?? [])
              .map((kitchen) => String(kitchen?.id || '').trim())
              .filter(Boolean)
          )
        : null
    const placesById = new Map<string, Place>()
    for (const place of placesSource.value?.value ?? []) {
      const placeId = String(place?.id || '').trim()
      if (placeId) placesById.set(placeId, place)
    }

    return (source.value?.value ?? [])
      .filter((kitchen) => {
        if (!allowedKitchenIds) return true
        const kitchenId = String(kitchen?.id || '').trim()
        return kitchenId ? allowedKitchenIds.has(kitchenId) : false
      })
      .map((kitchen) => {
        const kitchenId = String(kitchen?.id || '').trim()
        const resolvedPlaceId = String(kitchen?.place_id || kitchenId).trim()
        const place = shouldHydrate ? placesById.get(resolvedPlaceId) ?? null : null

        return {
          ...pickPlaceForKitchen(place),
          ...kitchen,
          id: kitchenId,
        }
      })
      .filter((kitchen) => Boolean(kitchen.id))
  })

  const count = computed(() => kitchens.value.length)
  const pending = computed(() => {
    if (scopeRef.value === 'mine' && (!currentUid.value || !currentAppId.value)) return false
    if (scopeRef.value === 'mine') {
      return source.value?.value === undefined || overlaySource.value?.value === undefined
    }
    return source.value?.value === undefined
  })

  return {
    kitchens,
    count,
    pending,
  }
}
