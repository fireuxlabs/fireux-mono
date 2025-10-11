import { useFirestoreManager } from '#imports'
import type { Place } from '../models/place.model'
import { canonicalPlaceId } from './usePlacesGoogle'

export function usePlaceSave() {
  const { setDocument } = useFirestoreManager()

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

    await setDocument('places', id, payload)
  }

  return { savePlace }
}
