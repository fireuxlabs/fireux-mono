import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import type { Place } from '../../../../../../models/objects/place.model'
import { toPlaceCollectionPath, usePlaceTypesConfig } from '../utils/placeCollections'

export interface UsePlaceClaimOptions {
  type?: string | null
  types?: string[]
}

export function usePlaceClaim(options: UsePlaceClaimOptions = {}) {
  const { updateDocument } = useFirestoreManager()
  const configuredTypes = usePlaceTypesConfig()

  async function claimPlace(placeId: string): Promise<{ claimedBy: string }> {
    if (!placeId) {
      throw new Error('Place id is required')
    }

    const { uid } = await requireUid()
    const types = options.types ?? configuredTypes
    const collectionPath = toPlaceCollectionPath(options.type, types)

    await updateDocument<Place>(collectionPath, placeId, {
      claimed_by: uid,
    } as Partial<Place>)

    return { claimedBy: uid }
  }

  return { claimPlace }
}
