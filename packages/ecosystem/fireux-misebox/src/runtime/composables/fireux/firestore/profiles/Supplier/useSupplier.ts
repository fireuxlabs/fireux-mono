// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/useSupplier.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile.ts'
import {
  supplierConfig,
  type SupplierCore,
} from '../../../../../models/profiles/Supplier/Supplier.model.ts'
import type { SupplierCard } from './main/useSupplierInterface.ts'
import { useSupplierComputed } from './main/useSupplierComputed.ts'
import { useSupplierInterface } from './main/useSupplierInterface.ts'
import { useSupplierUpdate } from './main/useSupplierUpdate.ts'
import { useSupplierCreate } from './main/useSupplierCreate.ts'

export type { SupplierCore as SupplierProfile, SupplierCard }

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
  const { profile: refs, pending } = useProfile<SupplierCore>(supplierConfig)
  const { coreProfile, appProfile } = refs

  const computed = useSupplierComputed(refs, pending)
  const ui = useSupplierInterface(refs)
  const update = useSupplierUpdate(refs)
  const create = useSupplierCreate()

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
