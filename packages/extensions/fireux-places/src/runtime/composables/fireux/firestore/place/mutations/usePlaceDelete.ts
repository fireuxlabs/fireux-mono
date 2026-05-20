import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

const COLLECTION_PATH = 'places'

export function usePlaceDelete() {
  const { deleteDocument } = useFirestoreManager()

  const deletePlace = async (placeId: string) => {
    const id = String(placeId ?? '').trim()
    if (!id) {
      throw new Error('[usePlaceDelete] placeId is required')
    }

    await deleteDocument(COLLECTION_PATH, id)
  }

  return { deletePlace }
}
