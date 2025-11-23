// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChef.ts

import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import {
  chefConfig,
  type ChefProfile,
  type ChefCoreProfile,
  type ChefCard,
} from '../../../../models/profiles/Chef.model.ts'
import { useChefComputed } from './main/useChefComputed.ts'
import { useChefInterface } from './main/useChefInterface.ts'
import { useChefUpdate } from './main/useChefUpdate.ts'
import { useChefCreate } from './main/useChefCreate.ts'

export type { ChefProfile, ChefCoreProfile, ChefCard }

/**
 * useChef
 * - Runtime facade for Chef profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill, cell, profileCore, profileApp)
 *   - update helpers
 */
export function useChef() {
  const { profile: refs, pending } = useProfile<ChefProfile>(chefConfig)
  const { coreProfile, appProfile } = refs

  // canonical user for UI layer
  const { coreUser } = useUser()

  const computed = useChefComputed(refs, pending)
  const ui = useChefInterface(refs, coreUser)
  const update = useChefUpdate(refs)
  const create = useChefCreate()

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    ...computed,
    ...ui,
    ...update,
    ...create,
  }
}
