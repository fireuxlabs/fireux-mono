// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: claim Places through the same trusted sparse mutation boundary.
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import {
  updatePlaceDocument,
  type UsePlaceUpdateOptions,
} from './usePlaceUpdate'

export function usePlaceClaim(options: UsePlaceUpdateOptions = {}) {
  async function claimPlace(placeId: string): Promise<{ claimedBy: string }> {
    if (!placeId) {
      throw new Error('Place id is required')
    }

    const { uid } = await requireUid()
    await updatePlaceDocument(placeId, { claimed_by: uid }, options)

    return { claimedBy: uid }
  }

  return { claimPlace }
}
