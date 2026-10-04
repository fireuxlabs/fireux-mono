// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: persist only present shared currency and business-hours onboarding data.
// Concurrent edit — 2026-07-21 14:13 CEST — Werkbox Firebase hardening: route idempotent Place creation through the authenticated server boundary.
// Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: submit only the provider identity and never browser-authored Place truth.
// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: expose bounded preview and trusted completion calls.
import { useRoute } from '#imports'
import { ref, watch, type WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import type { PlaceUpsertInput } from '../../../models/place-onboarding.model.ts'
import type {
  PlaceOnboardingCompleteInput,
  PlaceOnboardingCompleteResult,
  PlaceOnboardingEnrichment,
  PlaceOnboardingPreview,
} from '../../../models/place-onboarding.model.ts'
import { canonicalPlaceId } from '../fetch/google/usePlacesGoogle'

export interface UsePlaceCreateOptions {
  sources?: WatchSource[]
}

export const PlaceCreatePlan = defineFireuxCreatePlan({
  family: 'with_provision',
})

export function usePlaceCreate(options: UsePlaceCreateOptions = {}) {
  const { currentUser } = useAuth(), config = useFireUXConfig(), route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const sources = [() => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), appPending, appError, appOutcome, () => route.fullPath, ...(options.sources || [])]
  const captureIntent = useCommandScope(sources)
  const scopeEpoch = ref(0)
  watch(sources, () => { scopeEpoch.value += 1 }, { flush: 'sync' })
  async function authHeaders() {
    const uid = currentUser.value?.uid, isCurrent = captureIntent()
    const assertCurrent = () => { if (!uid || !isCurrent()) throw new Error('The account, App, Place or page changed. Reopen Place setup.') }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Place setup.')
    const token = await user.getIdToken()
    assertCurrent()
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
    const body = JSON.parse(JSON.stringify(input)) as PlaceOnboardingCompleteInput
    const id = canonicalPlaceId(body.id)
    if (!id) throw new Error('Choose a Place before continuing.')
    const result = await $fetch<PlaceOnboardingCompleteResult>(
      '/api/places/onboarding/complete',
      {
        method: 'POST',
        headers: await authHeaders(),
        body: { ...body, id },
      }
    )
    if (result?.ok !== true || result.id !== id) {
      throw new Error(
        '[usePlaceCreate] Place onboarding completion response was invalid.'
      )
    }
    return result
  }

  async function enrichPlaceOnboarding(idValue: string) {
    const id = canonicalPlaceId(idValue)
    if (!id) throw new Error('Choose a Place before continuing.')
    const result = await $fetch<PlaceOnboardingEnrichment>('/api/places/onboarding/enrich', {
      method: 'POST',
      headers: await authHeaders(),
      body: { id },
    })
    if (result?.id !== id || typeof result.generated !== 'boolean') throw new Error('Place enrichment response did not match the requested Place.')
    return result
  }

  return {
    captureIntent,
    scopeEpoch,
    completePlaceOnboarding,
    createPlan: PlaceCreatePlan,
    ensurePlaceExists,
    enrichPlaceOnboarding,
    createPlace: ensurePlaceExists,
    previewPlaceOnboarding,
  }
}
