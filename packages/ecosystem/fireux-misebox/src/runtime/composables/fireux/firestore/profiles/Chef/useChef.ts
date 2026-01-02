// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/useChef.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile.ts'
import {
  chefConfig,
  type ChefCore,
} from '../../../../../models/profiles/Chef/Chef.model.ts'
import type { ChefCard } from './utils/view/useChefInterface'
import { useChefComputed } from './main/useChefComputed.ts'
import { useChefInterface } from './utils/view/useChefInterface'
import { useChefUpdate } from './main/useChefUpdate.ts'
import { useChefCreate } from './main/useChefCreate.ts'

export type { ChefCore, ChefCard }

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
  const { profile: refs, pending } = useProfile<ChefCore>(chefConfig)
  const { coreProfile, appProfile } = refs

  const computed = useChefComputed(refs, pending)
  const ui = useChefInterface(refs)
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
