// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: claim Places through the same trusted sparse mutation boundary.
// Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: fail closed until a provider-backed ownership proof workflow exists.
import type { UsePlaceUpdateOptions } from './usePlaceUpdate'

export function usePlaceClaim(_options: UsePlaceUpdateOptions = {}) {
  async function claimPlace(_placeId: string): Promise<{ claimedBy: string }> {
    throw new Error(
      'Place claiming requires a verified ownership workflow and is not currently available.'
    )
  }

  return { claimPlace }
}
