import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useFirestore } from 'vuefire'
import type { Place, PlaceUpsertInput } from '../../../../../../models/objects/place.model'
import { canonicalPlaceId } from '../fetch/google/usePlacesGoogle'
import { toPlaceCollectionPath, usePlaceTypesConfig } from '../utils/placeCollections'

export const PlacePayload = {
  id: '',
  name: '',
  short_name: '',
  formatted_address: '',
  short_address: '',
  lat: 0,
  lng: 0,
  place_image: '',
  image_shade: 'none',
  claimed_by: '',
  source: '',
  search_term: '',
}

export const PlaceStampOptions = {
  creator: true,
} as const

export interface UsePlaceCreateOptions {
  types?: string[]
}

export function usePlaceCreate(options: UsePlaceCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreManager()
  const configuredTypes = usePlaceTypesConfig()

  async function createPlace(
    payload: Partial<PlaceUpsertInput> & { id?: string }
  ): Promise<{ created: boolean; id: string }> {
    const id = canonicalPlaceId((payload as any)?.id ?? (payload as any)?.place_id)
    if (!id) {
      throw new Error('Place id is required')
    }

    const types = options.types ?? configuredTypes
    const collectionPath = toPlaceCollectionPath(undefined, types)

    const ref = doc(db, collectionPath, id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { created: false, id }
    }

    const data = {
      ...PlacePayload,
      ...payload,
      id,
    } satisfies Omit<Place, 'created_at' | 'updated_at' | 'creator_id'>

    await setDocument<Place>(collectionPath, id, data as Place, {
      creator: true,
    })

    return { created: true, id }
  }

  return { createPlace }
}
