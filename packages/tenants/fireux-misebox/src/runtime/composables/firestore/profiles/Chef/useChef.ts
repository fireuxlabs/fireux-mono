import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
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
 * - Thin facade over generic profile stack
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile
 *   - computed helpers
 *   - UI helpers
 *   - update helpers
 */
export function useChef() {
  const { profile: refs, pending } = useProfile<ChefProfile>(chefConfig)
  const { coreProfile, appProfile } = refs

  const computed = useChefComputed(refs, pending)
  const ui = useChefInterface(refs)
  const update = useChefUpdate(refs)

  return {
    // raw
    profile: refs,
    coreProfile,
    appProfile,
    pending,

    // helpers
    ...computed,
    ...ui,
    ...update,
  }
}
