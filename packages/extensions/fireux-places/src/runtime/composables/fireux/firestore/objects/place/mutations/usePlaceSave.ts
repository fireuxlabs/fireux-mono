import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import { useFirestore } from 'vuefire'
import type { Place } from '../../../../../../models/objects/place.model'
import { canonicalPlaceId } from '../fetch/google/usePlacesGoogle'
import { toPlaceCollectionPath, usePlaceTypesConfig } from '../utils/placeCollections'

export interface UsePlaceSaveOptions {
  type?: string | null | undefined
  types?: string[]
}

export function usePlaceSave(options: UsePlaceSaveOptions = {}) {
  const { setDocument } = useFirestoreManager()
  const db = useFirestore()
  const configuredTypes = usePlaceTypesConfig()

  /** Ensure a place document exists in Firestore. */
  async function ensurePlaceExists(place: Place): Promise<boolean> {
    const id = canonicalPlaceId(place.place_id)
    if (!id) return false

    const types = options.types ?? configuredTypes
    const collectionPath = toPlaceCollectionPath(options.type, types)

    const ref = doc(db, collectionPath, id)
    const snapshot = await getDoc(ref)

    if (snapshot.exists()) {
      if (import.meta.dev)
        console.log(`[fireux-places] Place already exists: ${id}`)
      return true
    }

    const payload: Record<string, any> = {
      ...place,
      place_id: id,
      source: 'firestore',
    }

    if (collectionPath !== 'places' && options.type) {
      payload.type = options.type
    }

    delete payload.created_at
    delete payload.updated_at

    await setDocument(collectionPath, id, payload)

    if (import.meta.dev) console.log(`[fireux-places] Created new place: ${id}`)

    return true
  }

  return { ensurePlaceExists }
}

