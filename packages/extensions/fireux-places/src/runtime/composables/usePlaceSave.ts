import { useFirestoreManager } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Place } from '../models/place.model'
import { canonicalPlaceId } from './usePlacesGoogle'

export function usePlaceSave() {
  const { setDocument } = useFirestoreManager()
  const db = useFirestore()

  async function savePlace(place: Place) {
    const id = canonicalPlaceId(place.place_id)
    if (!id) {
      throw new Error('Cannot save place without a valid place_id')
    }

    const payload: Record<string, any> = {
      ...place,
      place_id: id,
      source: 'firestore',
    }

    delete payload.created_at
    delete payload.updated_at

    const docRef = doc(db, 'places', id)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      throw new Error(
        'This place already exists.'
      )
    }

    await setDocument('places', id, payload)
  }

  return { savePlace }
}
