import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import type { Place } from '../../../../../../models/objects/place.model'

export function usePlaceClaim() {
  const { updateDocument } = useFirestoreManager()

  async function claimPlace(placeId: string): Promise<{ claimedBy: string }> {
    if (!placeId) {
      throw new Error('Place id is required')
    }

    const { uid } = await requireUid()
    await updateDocument<Place>('places', placeId, {
      claimed_by: uid,
    } as Partial<Place>)

    return { claimedBy: uid }
  }

  return { claimPlace }
}
