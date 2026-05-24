// FILE: packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/useSupplier.ts

import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { AppSupplier, Supplier } from '../../../../models/supplier/Supplier.model'
import type { SupplierCard } from './utils/view/useSupplierInterface'
import { useSupplierInterface } from './utils/view/useSupplierInterface'
import { useSupplierCreate } from './mutations/useSupplierCreate'
import { useSupplierRecord } from './fetch/useSupplierRecord'
import { useSupplierUpdate } from './mutations/useSupplierUpdate'
import { useSupplierSeo } from './seo/useSupplierSeo'
import { useSupplierComputed } from './utils/useSupplierComputed'

export type {
  SupplierCard,
  Supplier as SupplierRecord,
  AppSupplier as SupplierWorkspace,
}

/**
 * useSupplier
 * - Runtime facade for Supplier records and supplier workspace state
 * - Exposes:
 *   - raw refs: supplier, coreSupplier, appSupplier, pending
 *   - computed helpers
 *   - UI helpers (pill etc.) that use coreUser
 *   - update helpers
 */
export function useSupplier() {
  const { uid } = useAuth()
  const { supplier, coreSupplier, appSupplier, pending } = useSupplierRecord(uid)
  const refs = { coreSupplier, appSupplier }

  const computed = useSupplierComputed(refs, pending)
  const ui = useSupplierInterface(refs)
  const update = useSupplierUpdate(refs)
  const create = useSupplierCreate()

  return {
    supplier,
    coreSupplier,
    appSupplier,
    pending,
    ...computed,
    ...ui,
    ...update,
    ...create,
    useSupplierSeo,
  }
}
