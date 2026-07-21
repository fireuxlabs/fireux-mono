// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: persist only present shared currency and business-hours onboarding data.
// Concurrent edit — 2026-07-21 14:13 CEST — Werkbox Firebase hardening: route idempotent Place creation through the authenticated server boundary.
// Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: submit only the provider identity and never browser-authored Place truth.
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { canonicalPlaceId } from '../fetch/google/usePlacesGoogle'

export interface UsePlaceCreateOptions {
  type?: string | null | undefined
  types?: string[]
}

export const PlaceCreatePlan = defineFireuxCreatePlan({
  family: 'with_provision',
})

export function usePlaceCreate(_options: UsePlaceCreateOptions = {}) {
  async function ensurePlaceExists(
    place: Partial<PlaceUpsertInput> & { id?: string }
  ): Promise<boolean> {
    const id = canonicalPlaceId((place as any)?.id ?? (place as any)?.place_id)
    if (!id) return false

    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{ ok: boolean; id: string; created: boolean }>(
      '/api/places/ensure',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { id },
      }
    )
    if (
      result?.ok !== true ||
      result.id !== id ||
      typeof result.created !== 'boolean'
    ) {
      throw new Error('[usePlaceCreate] Place ensure response was invalid.')
    }

    if (import.meta.dev) {
      console.info(
        `[fireux-places] ${result.created ? 'Verified and created' : 'Reused'} Place: ${id}`
      )
    }
    return true
  }

  return {
    createPlan: PlaceCreatePlan,
    ensurePlaceExists,
    createPlace: ensurePlaceExists,
  }
}
