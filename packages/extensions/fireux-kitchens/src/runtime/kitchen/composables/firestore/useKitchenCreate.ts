import { computed } from 'vue'
import { useWorkspaceCreation } from 'fireux-core/runtime/workspace/composables/useWorkspaceCreation'
import { useKitchenAccess } from '../useKitchenAccess'
import {
  kitchenCapacity,
  resolveKitchenAllowance,
} from '../../utils/kitchen-capacity'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { FireuxEntityCreateResult } from 'fireux-core/runtime/models/utils/entity-create.model'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { usePlaceCreate } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceCreate'
import type {
  KitchenCreateInput,
  KitchenShellCreateInput,
} from '../../models/kitchen-input.model.ts'
import type {
  KitchenDirectoryContributionResult,
  KitchenOnboardingCompleteInput,
  KitchenOnboardingCompleteResult,
  KitchenOnboardingPreview,
  KitchenShellCreateResult,
} from '../../models/kitchen-onboarding.model.ts'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenCreateDraft = KitchenCreateInput

export type KitchenCreateResult = FireuxEntityCreateResult & {
  slug?: string
}

export const KitchenCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function useKitchenCreate() {
  const { currentUser } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const access = useKitchenAccess()
  const allowance = computed(() =>
    resolveKitchenAllowance(appSession.appUser.value, access.ids.value)
  )
  const accountReady = computed(
    () =>
      Boolean(appSession.uid.value) &&
      !appSession.pending.value &&
      !appSession.error.value &&
      !access.pending.value &&
      !access.error.value
  )
  const creation = useWorkspaceCreation(
    'kitchen',
    () => ({ count: access.ids.value.length, outcome: access.outcome.value }),
    kitchenCapacity
  )
  const canCreate = computed(
    () =>
      accountReady.value && allowance.value.canAdd && creation.canCreate.value
  )
  const showUpgrade = computed(
    () =>
      accountReady.value &&
      allowance.value.showUpgrade &&
      creation.showUpgrade.value
  )

  const captureCommand = useCommandScope([
    currentUser,
    appSession.appUser,
    () => fireux.appId,
  ])
  const { ensurePlaceExists } = usePlaceCreate()

  function assertCurrent(isCurrent: () => boolean) {
    if (!isCurrent())
      throw new Error('Kitchen creation context changed. Try again.')
  }

  async function authHeaders(isCurrent: () => boolean) {
    const user = await useRequireUser()
    assertCurrent(isCurrent)
    if (user.uid !== currentUser.value?.uid)
      throw new Error('Kitchen creation context changed. Try again.')
    const token = await user.getIdToken()
    assertCurrent(isCurrent)
    return { Authorization: `Bearer ${token}` }
  }

  async function previewKitchenOnboarding(input: {
    place_id?: string
    kitchen_id?: string
    owner_user_id?: string
  }) {
    const isCurrent = captureCommand()
    input = { ...input }
    const result = await $fetch<KitchenOnboardingPreview>(
      '/api/kitchens/onboarding/preview',
      {
        method: 'POST',
        headers: await authHeaders(isCurrent),
        body: input,
      }
    )
    assertCurrent(isCurrent)
    if (!result?.place_id || !result.kitchen_id) {
      throw new Error('Kitchen onboarding preview was invalid.')
    }
    return result
  }

  async function completeKitchenOnboarding(
    input: KitchenOnboardingCompleteInput
  ) {
    const isCurrent = captureCommand()
    input = { ...input }
    const result = await $fetch<KitchenOnboardingCompleteResult>(
      '/api/kitchens/onboarding/complete',
      {
        method: 'POST',
        headers: await authHeaders(isCurrent),
        body: input,
      }
    )
    if (
      result?.ok !== true ||
      !normalizeString(result.kitchen_id) ||
      !normalizeString(result.owner_user_id)
    ) {
      throw new Error('Kitchen onboarding completion was invalid.')
    }
    return result
  }

  async function contributeKitchenDirectory(
    input: { place_id: string } | { name: string }
  ) {
    const isCurrent = captureCommand()
    input = { ...input }
    const result = await $fetch<KitchenDirectoryContributionResult>(
      '/api/kitchens/onboarding/contribute',
      {
        method: 'POST',
        headers: await authHeaders(isCurrent),
        body: input,
      }
    )
    if (
      result?.ok !== true ||
      !normalizeString(result.kitchen_id) ||
      ('place_id' in input && result.kitchen_id !== input.place_id)
    ) {
      throw new Error('Kitchen directory contribution was invalid.')
    }
    return result
  }

  async function createKitchen(
    input: KitchenCreateDraft
  ): Promise<KitchenCreateResult> {
    const isCurrent = captureCommand()
    const placeId = normalizeString(input.place_id)
    if (!placeId) {
      throw new Error('Choose the Place this Kitchen belongs to.')
    }

    const placeReady = await ensurePlaceExists({ id: placeId })
    if (!placeReady)
      throw new Error('The selected Place could not be prepared.')

    assertCurrent(isCurrent)
    const preview = await previewKitchenOnboarding({ place_id: placeId })
    assertCurrent(isCurrent)
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
    const isCurrent = captureCommand()
    input = { ...input }
    if (input.intent !== 'create_shell') {
      throw new Error('Explicit Kitchen shell creation intent is required.')
    }
    const name = normalizeString(input.name)
    if (!name) throw new Error('Kitchen name is required.')

    const result = await $fetch<KitchenShellCreateResult>(
      '/api/kitchens/onboarding/shell',
      {
        method: 'POST',
        headers: await authHeaders(isCurrent),
        body: {
          intent: 'create_shell',
          name,
          ...(input.owner_user_id
            ? { owner_user_id: input.owner_user_id }
            : {}),
        },
      }
    )
    if (
      result?.ok !== true ||
      !normalizeString(result.kitchen_id) ||
      !normalizeString(result.owner_user_id)
    ) {
      throw new Error('Kitchen shell creation was invalid.')
    }
    return result
  }

  return {
    allowance,
    accountReady,
    hasAccount: computed(() =>
      Boolean(appSession.uid.value && appSession.appUser.value)
    ),
    canCreate,
    showUpgrade,
    creationEnabled: creation.creationEnabled,
    completeKitchenOnboarding,
    contributeKitchenDirectory,
    createPlan: KitchenCreatePlan,
    createKitchen,
    createKitchenShell,
    previewKitchenOnboarding,
  }
}
