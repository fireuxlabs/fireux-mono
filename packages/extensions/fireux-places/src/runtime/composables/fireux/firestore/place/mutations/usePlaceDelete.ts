import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'

export function usePlaceDelete() {
  const { deleteDocument } = useFirestoreManager()

  const deletePlace = async (placeId: string) => {
    const id = String(placeId ?? '').trim()
    if (!id) {
      throw new Error('[usePlaceDelete] placeId is required')
    }

    await deleteDocument(PlaceStorage.collection, id)
  }

  return { deletePlace }
}
