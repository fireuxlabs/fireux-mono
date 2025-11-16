// FILE: packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplier.ts

import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import {
  supplierConfig,
  type SupplierProfile,
  type SupplierCoreProfile,
  type SupplierCard,
} from '../../../../models/profiles/Supplier.model.ts'
import { useSupplierComputed } from './main/useSupplierComputed.ts'
import { useSupplierInterface } from './main/useSupplierInterface.ts'
import { useSupplierUpdate } from './main/useSupplierUpdate.ts'

export type { SupplierProfile, SupplierCoreProfile, SupplierCard }

/**
 * useSupplier
 * - Runtime facade for Supplier profiles
 * - Exposes:
 *   - raw refs: profile, coreProfile, appProfile, pending
 *   - computed helpers
 *   - UI helpers (pill etc.) that use coreUser
 *   - update helpers
 */
export function useSupplier() {
  const { profile: refs, pending } = useProfile<SupplierProfile>(supplierConfig)
  const { coreProfile, appProfile } = refs

  // canonical user to feed UI layer
  const { coreUser } = useUser()

  const computed = useSupplierComputed(refs, pending)
  const ui = useSupplierInterface(refs, coreUser)
  const update = useSupplierUpdate(refs)

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,
    ...computed,
    ...ui,
    ...update,
  }
}
