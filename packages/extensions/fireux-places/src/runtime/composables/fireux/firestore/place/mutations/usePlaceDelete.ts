import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'

const COLLECTION_PATH = 'places'

export function usePlaceDelete() {
  const { deleteDocument } = useFirestoreManager()
  const { deleteSeoIndexDoc } = useSeoIndexWrite()

  const deletePlace = async (placeId: string) => {
    const id = String(placeId ?? '').trim()
    if (!id) {
      throw new Error('[usePlaceDelete] placeId is required')
    }

    await deleteDocument(COLLECTION_PATH, id)
    await deleteSeoIndexDoc('seo_index_places', id)
  }

  return { deletePlace }
}
