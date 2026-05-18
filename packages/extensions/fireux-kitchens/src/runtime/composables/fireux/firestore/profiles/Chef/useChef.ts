// FILE: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/useChef.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { chefConfig } from './config/chefConfig'
import type { Chef } from '../../../../../models/profiles/Chef/Chef.model'
import { useChefComputed } from './utils/view/useChefComputed'
import { useChefCreate } from './mutations/useChefCreate'
import { useChefUpdate } from './mutations/useChefUpdate'
import type { ChefCard } from './utils/view/useChefInterface'
import { useChefInterface } from './utils/view/useChefInterface'

export type { ChefCard, Chef }

/**
 * FireUX stack family: Identity/profile capability.
 * Entity: Chef.
 *
 * Chef is a kitchen-domain profile capability, not a console workspace.
 * Kitchen links are relationship data; Kitchen authority belongs to Kitchen
 * operator/membership seams.
 *
 * - Exposes:
 *   - raw refs: profileRefs, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill, cell, profile)
 *   - update helpers
 */
export function useChef() {
  const { profile: refs, pending } = useProfile<Chef>(chefConfig)
  const { coreProfile, appProfile } = refs

  const computed = useChefComputed(refs, pending)
  const ui = useChefInterface(refs)
  const update = useChefUpdate(refs)
  const create = useChefCreate()

  return {
    profileRefs: refs,
    coreProfile,
    appProfile,
    pending,

    ...computed,
    ...ui,
    ...update,
    ...create,
  }
}
