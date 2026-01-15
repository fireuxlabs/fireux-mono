import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { toPlaceCollectionPath } from '../utils/placeCollections'

export interface UsePlaceCreateOptions {
  types?: string[]
}

export function usePlaceCreate(options: UsePlaceCreateOptions = {}) {
  const { createDocument } = useFirestoreManager()

  async function create(payload: Record<string, any>): Promise<void> {
    const collectionPath = toPlaceCollectionPath(null, options.types ?? [])
    await createDocument(collectionPath, payload)
  }

  return { create }
}
