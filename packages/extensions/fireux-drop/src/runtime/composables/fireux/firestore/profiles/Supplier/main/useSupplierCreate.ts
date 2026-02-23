// Action: ENSURE · Phases: 1–4
// Sketch: Supplier create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'vuefire'
import type { SupplierApp, SupplierCore } from '../../../../../../models/profiles/Supplier/Supplier.model'
import { supplierConfig } from '../../../../../../models/profiles/Supplier/Supplier.model'

export function useSupplierCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()

  async function ensureSupplier(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await ensureUser()
    const { uid } = await requireUid()
    const { appId, isTenant } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, supplierConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        id: uid,
        title: '',
        subtitle: '',
        tagline: '',
        tags: [],
        summary: '',
        bio_long: '',
        specialties: [],
        categories: [],
        organization_name: '',
        business_type: '',
        locations: [],
        years_in_business: 0,
        products_offered: [],
        employee_count: 0,
        certifications: [],
        delivery_range: 0,
      } satisfies Omit<SupplierCore, 'created' | 'updated'>

      await setDocument<SupplierCore>(supplierConfig.collectionName, uid, payload as SupplierCore, {
        creator: 'require',
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${supplierConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, supplierConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {
          id: uid,
        } satisfies Omit<SupplierApp, 'created' | 'updated'>

        await setDocument<SupplierApp>(appCollection, uid, payload as SupplierApp, {
          creator: 'require',
        })
        createdApp = true
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { ensureSupplier }
}
