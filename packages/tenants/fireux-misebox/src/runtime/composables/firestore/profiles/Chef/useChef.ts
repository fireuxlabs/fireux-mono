// FILE: packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChef.ts

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

export type { ChefProfile, ChefCoreProfile, ChefCard }

/**
 * useChef
 * - Runtime facade for Chef profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill etc.) that use coreUser
 *   - update helpers
 */
export function useChef() {
  const { profile: refs, pending } = useProfile<ChefProfile>(chefConfig)
  const { coreProfile, appProfile } = refs

  // canonical user to feed UI layer
  const { coreUser } = useUser()

  const computed = useChefComputed(refs, pending)
  const ui = useChefInterface(refs, coreUser)
  const update = useChefUpdate(refs)

  return {
    // raw firestore refs
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    // computed helpers
    ...computed,

    // UI helpers (pill etc., all using coreUser)
    ...ui,

    // update helpers
    ...update,
  }
}
