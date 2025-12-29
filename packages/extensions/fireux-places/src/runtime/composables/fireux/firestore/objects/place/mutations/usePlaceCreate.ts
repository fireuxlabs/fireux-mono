import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import { toPlaceCollectionPath, usePlaceTypesConfig } from '../utils/placeCollections'

export interface UsePlaceCreateOptions {
  types?: string[]
}

export function usePlaceCreate(options: UsePlaceCreateOptions = {}) {
  const { createDocument } = useFirestoreManager()
  const configuredTypes = usePlaceTypesConfig()

  async function createForType(
    type: string | null | undefined,
    payload: Record<string, any>
  ): Promise<void> {
    const types = options.types ?? configuredTypes
    const collectionPath = toPlaceCollectionPath(type, types)

    const requested = type || 'other'
    const allowed = new Set([...types, 'other'])
    const finalType = allowed.has(requested) ? requested : 'other'

    await createDocument(collectionPath, { ...payload, type: finalType })
  }

  return { createForType }
}
