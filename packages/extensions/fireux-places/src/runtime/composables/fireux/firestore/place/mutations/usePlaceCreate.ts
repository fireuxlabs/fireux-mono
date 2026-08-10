// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: persist only present shared currency and business-hours onboarding data.
// Concurrent edit — 2026-07-21 14:13 CEST — Werkbox Firebase hardening: route idempotent Place creation through the authenticated server boundary.
// Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: submit only the provider identity and never browser-authored Place truth.
// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: expose bounded preview and trusted completion calls.
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import type { PlaceUpsertInput } from '../../../../../models/place.model'
import type {
  PlaceOnboardingCompleteInput,
  PlaceOnboardingCompleteResult,
  PlaceOnboardingPreview,
  PlaceManualCreateInput,
  PlaceManualCreateResult,
} from '../../../../../models/place-onboarding.model'
import { canonicalPlaceId } from '../fetch/google/usePlacesGoogle'

export interface UsePlaceCreateOptions {
  type?: string | null | undefined
  types?: string[]
}

export const PlaceCreatePlan = defineFireuxCreatePlan({
  family: 'with_provision',
})

export function usePlaceCreate(_options: UsePlaceCreateOptions = {}) {
  async function authHeaders() {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  async function ensurePlaceExists(
    place: Partial<PlaceUpsertInput> & { id?: string }
  ): Promise<boolean> {
    const id = canonicalPlaceId((place as any)?.id ?? (place as any)?.place_id)
    if (!id) return false

    const result = await $fetch<{ ok: boolean; id: string; created: boolean }>(
      '/api/places/ensure',
      {
        method: 'POST',
        headers: await authHeaders(),
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

  async function previewPlaceOnboarding(idValue: string) {
    const id = canonicalPlaceId(idValue)
    if (!id) throw new Error('Choose a Place before continuing.')
    const result = await $fetch<PlaceOnboardingPreview>(
      '/api/places/onboarding/preview',
      {
        method: 'POST',
        headers: await authHeaders(),
        body: { id },
      }
    )
    if (!result || result.id !== id || typeof result.existing !== 'boolean') {
      throw new Error('[usePlaceCreate] Place onboarding preview was invalid.')
    }
    return result
  }

  async function completePlaceOnboarding(input: PlaceOnboardingCompleteInput) {
    const id = canonicalPlaceId(input.id)
    if (!id) throw new Error('Choose a Place before continuing.')
    const result = await $fetch<PlaceOnboardingCompleteResult>(
      '/api/places/onboarding/complete',
      {
        method: 'POST',
        headers: await authHeaders(),
        body: { ...input, id },
      }
    )
    if (result?.ok !== true || result.id !== id) {
      throw new Error(
        '[usePlaceCreate] Place onboarding completion was invalid.'
      )
    }
    return result
  }

  async function createManualPlace(input: PlaceManualCreateInput) {
    const result = await $fetch<PlaceManualCreateResult>(
      '/api/places/onboarding/manual',
      {
        method: 'POST',
        headers: await authHeaders(),
        body: input,
      }
    )
    if (result?.ok !== true || !canonicalPlaceId(result.id)) {
      throw new Error('[usePlaceCreate] Manual Place response was invalid.')
    }
    return result
  }

  return {
    completePlaceOnboarding,
    createManualPlace,
    createPlan: PlaceCreatePlan,
    ensurePlaceExists,
    createPlace: ensurePlaceExists,
    previewPlaceOnboarding,
  }
}
