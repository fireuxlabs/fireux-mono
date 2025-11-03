import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreManager.ts'
import { useFirestore } from 'vuefire'
import type { Place } from '../models/place.model'
import { canonicalPlaceId } from './usePlacesGoogle'

export function usePlaceSave() {
  const { setDocument } = useFirestoreManager()
  const db = useFirestore()

  /** Ensure a place document exists in Firestore. */
  async function ensurePlaceExists(place: Place): Promise<boolean> {
    const id = canonicalPlaceId(place.place_id)
    if (!id) return false

    const ref = doc(db, 'places', id)
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

    delete payload.created_at
    delete payload.updated_at

    await setDocument('places', id, payload)

    if (import.meta.dev) console.log(`[fireux-places] Created new place: ${id}`)

    return true
  }

  return { ensurePlaceExists }
}
