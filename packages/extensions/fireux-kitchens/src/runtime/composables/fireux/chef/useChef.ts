// FILE: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/chef/useChef.ts
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: join the current canonical User into Chef UI helpers.

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import { chefConfig } from '../firestore/profiles/Chef/config/chefConfig'
import type { Chef } from '../../../models/chef.model'
import { useChefCreate } from '../firestore/profiles/Chef/mutations/useChefCreate'
import { useChefUpdate } from '../firestore/profiles/Chef/mutations/useChefUpdate'
import { useChefComputed } from './useChefComputed'
import { useChefSeo } from './useChefSeo'
import type { ChefCard } from './useChefInterface'
import { useChefInterface } from './useChefInterface'

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
  const { coreUser } = useUser()

  const computed = useChefComputed(refs, pending)
  const ui = useChefInterface(refs, coreUser)
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
    useChefSeo,
  }
}
