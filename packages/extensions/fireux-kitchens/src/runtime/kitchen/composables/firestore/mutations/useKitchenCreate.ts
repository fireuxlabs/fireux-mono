// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: link Kitchens to Place without copying Place presentation or operational defaults.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit Kitchen App support creation results.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen atomic attachment: route Workspace creation through trusted onboarding.
// Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: own Kitchen preview and completion transport in the create seam.
import type { FireuxEntityCreateResult } from 'fireux-core/runtime/models/utils/entity-create.model'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { usePlaceCreate } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceCreate'
import type {
  KitchenCreateInput,
  KitchenShellCreateInput,
} from '../../../models/kitchen-input.model.ts'
import type {
  KitchenOnboardingCompleteInput,
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
  KitchenShellCreateResult,
} from '../../../models/kitchen-onboarding.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenCreateDraft = KitchenCreateInput

export type KitchenCreateResult = FireuxEntityCreateResult & {
  slug?: string
}

export const KitchenCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function useKitchenCreate() {
  const { ensurePlaceExists } = usePlaceCreate({ type: 'kitchen' })

  async function authHeaders() {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  async function previewKitchenOnboarding(input: {
    place_id?: string
    kitchen_id?: string
    owner_user_id?: string
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
    input: KitchenCreateDraft
  ): Promise<KitchenCreateResult> {
    const placeId = normalizeString(input.place_id)
    if (!placeId) {
      throw new Error('Choose the Place this Kitchen belongs to.')
    }

    const placeReady = await ensurePlaceExists({ id: placeId })
    if (!placeReady)
      throw new Error('The selected Place could not be prepared.')

    const preview = await previewKitchenOnboarding({ place_id: placeId })
    const result = await completeKitchenOnboarding({
      place_id: preview.place_id,
      ...(preview.existing ? { kitchen_id: preview.kitchen_id } : {}),
    })

    return {
      id: result.kitchen_id,
      createdRoot: result.created_root,
      createdTeamMember: result.created_team_member,
      ...(result.slug ? { slug: result.slug } : {}),
    }
  }

  async function createKitchenShell(input: KitchenShellCreateInput) {
    if (input.intent !== 'create_shell') {
      throw new Error('Explicit Kitchen shell creation intent is required.')
    }
    const name = normalizeString(input.name)
    if (!name) throw new Error('Kitchen name is required.')

    const result = await $fetch<KitchenShellCreateResult>(
      '/api/kitchens/onboarding/shell',
      {
        method: 'POST',
        headers: await authHeaders(),
        body: {
          intent: 'create_shell',
          name,
          ...(input.owner_user_id
            ? { owner_user_id: input.owner_user_id }
            : {}),
        },
      }
    )
    if (result?.ok !== true || !normalizeString(result.kitchen_id)) {
      throw new Error('Kitchen shell creation was invalid.')
    }
    return result
  }

  return {
    completeKitchenOnboarding,
    createPlan: KitchenCreatePlan,
    createKitchen,
    createKitchenShell,
    previewKitchenOnboarding,
  }
}
