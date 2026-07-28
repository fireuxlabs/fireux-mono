// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: link Kitchens to Place without copying Place presentation or operational defaults.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit Kitchen App support creation results.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen atomic attachment: route Console creation through trusted onboarding.
// Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: own Kitchen preview and completion transport in the create seam.
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  KitchenCreateInput,
} from '../../../../../models/kitchen.model'
import type {
  KitchenOnboardingCompleteInput,
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
} from '../../../../../models/kitchen-onboarding.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenPlaceDraft = Record<string, unknown> & {
  id?: string
  name?: string
  short_name?: string
  slug?: string
}
type KitchenCreateDraft = KitchenCreateInput & {
  display_name?: string
  place?: KitchenPlaceDraft
}

export type KitchenCreateResult = ConsoleCreateResult & {
  slug?: string
}
export type KitchenCreateOptions = {
  collectionPath?: string
}

export type KitchenCreateModeOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

export const KitchenCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function useKitchenCreate(_options: KitchenCreateOptions = {}) {

  async function authHeaders() {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  async function previewKitchenOnboarding(input: {
    place_id?: string
    kitchen_id?: string
  }) {
    const result = await $fetch<KitchenOnboardingPreview>(
      '/api/kitchens/onboarding/preview',
      {
        method: 'POST',
        headers: await authHeaders(),
        body: input,
      }
    )
    if (!result?.place_id || !result.kitchen_id) {
      throw new Error('Kitchen onboarding preview was invalid.')
    }
    return result
  }

  async function completeKitchenOnboarding(
    input: KitchenOnboardingCompleteInput
  ) {
    const result = await $fetch<KitchenOnboardingCompleteResult>(
      '/api/kitchens/onboarding/complete',
      {
        method: 'POST',
        headers: await authHeaders(),
        body: input,
      }
    )
    if (result?.ok !== true || !normalizeString(result.kitchen_id)) {
      throw new Error('Kitchen onboarding completion was invalid.')
    }
    return result
  }

  async function createKitchen(
    input: KitchenCreateDraft = {},
    createOptions: KitchenCreateModeOptions = {}
  ): Promise<KitchenCreateResult> {
    return createKitchenConsole(input, createOptions)
  }

  async function createKitchenConsole(
    input: KitchenCreateDraft = {},
    createOptions: KitchenCreateModeOptions = {}
  ): Promise<KitchenCreateResult> {
    const existingRootId = normalizeString(createOptions.existingRootId)
    const placeId = normalizeString(input.place_id || input.place?.id)
    const displayName = normalizeString(
      input.identity?.display_name || input.display_name
    )
    if (!existingRootId && !placeId) {
      throw new Error('A linked Place is required to create a Kitchen console.')
    }

    const preview = await previewKitchenOnboarding({
      ...(placeId ? { place_id: placeId } : {}),
      ...(existingRootId ? { kitchen_id: existingRootId } : {}),
    })
    const result = await completeKitchenOnboarding({
      place_id: preview.place_id,
      ...(preview.existing ? { kitchen_id: preview.kitchen_id } : {}),
      ...(displayName ? { display_name: displayName } : {}),
    })

    return {
      id: result.kitchen_id,
      createdRoot: result.created_root,
      createdAppSupport: result.created_app_support,
      ...(result.slug ? { slug: result.slug } : {}),
    }
  }

  return {
    completeKitchenOnboarding,
    createPlan: KitchenCreatePlan,
    createKitchen,
    createKitchenConsole,
    previewKitchenOnboarding,
  }
}
