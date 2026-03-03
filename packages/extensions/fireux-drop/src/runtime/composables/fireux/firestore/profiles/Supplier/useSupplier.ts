// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/useSupplier.ts

import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile'
import { supplierConfig } from './config/supplierConfig'
import type { SupplierCore } from '../../../../../models/profiles/Supplier/Supplier.model'
import { useSupplierComputed } from './main/useSupplierComputed'
import { useSupplierCreate } from '../../Supplier/main/useSupplierCreate'
import { useSupplierUpdate } from './main/useSupplierUpdate'
import type { SupplierCard } from './utils/view/useSupplierInterface'
import { useSupplierInterface } from './utils/view/useSupplierInterface'

export type { SupplierCard, SupplierCore as SupplierProfile }

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
