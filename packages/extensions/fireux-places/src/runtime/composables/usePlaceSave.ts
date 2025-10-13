import { useFirestoreManager } from '#fireux-core-composables/firestore/useFirestoreManager'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Place } from '../models/place.model'
import { canonicalPlaceId } from './usePlacesGoogle'

export function usePlaceSave() {
  const { setDocument } = useFirestoreManager()
  const db = useFirestore()

  async function savePlace(place: Place) {
    const id = canonicalPlaceId(place.place_id)
    if (!id) throw new Error('Cannot save place without a valid place_id')

    const payload: Record<string, any> = {
      ...place,
      place_id: id,
      source: 'firestore',
    }

    // Prevent client timestamps from overwriting server-managed fields
    delete payload.created_at
    delete payload.updated_at

    const docRef = doc(db, 'places', id)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      // idempotent: OK if it already exists
      if (import.meta.dev)
        console.log(`[fireux-places] Place already exists: ${id}`)
      return true
    }

    await setDocument('places', id, payload)
    if (import.meta.dev) console.log(`[fireux-places] Created new place: ${id}`)
    return true
  }

  return { savePlace }
}
