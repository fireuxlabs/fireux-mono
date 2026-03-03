// Action: ENSURE · Phases: 1–4
// Sketch: Supplier create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'vuefire'
import type { SupplierApp, SupplierCore } from '../../models/supplier/Supplier.model'
import { supplierConfig } from './supplierConfig'

export function useSupplierCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

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
        supplier_headline: '',
        supplier_bio: '',
        supplier_image: '',
        supplier_product_categories: [] as string[],
        supplier_delivery_areas: [] as string[],
        supplier_organization_name: '',
        title: '',
        subtitle: '',
        tagline: '',
        tags: [] as string[],
        summary: '',
        bio_long: '',
        specialties: [] as string[],
        categories: [] as string[],
        organization_name: '',
        business_type: '',
        locations: [] as Array<{ city: string; country: string }>,
        years_in_business: 0,
        products_offered: [] as string[],
        employee_count: 0,
        certifications: [] as string[],
        delivery_range: 0,
      } satisfies Omit<SupplierCore, 'created' | 'updated' | 'id'>

      await setDocument<SupplierCore>(supplierConfig.collectionName, uid, payload as unknown as SupplierCore, {
        creator: true,
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${supplierConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, supplierConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {
          admin_ids: [] as string[],
          join_requests: [] as string[],
          console_enabled: true,
        } satisfies Omit<SupplierApp, 'created' | 'updated' | 'id'>

        await setDocument<SupplierApp>(appCollection, uid, payload as SupplierApp, {
          creator: true,
        })
        createdApp = true
      }
    }

    await upsertSeoIndexDoc('seo_index_suppliers', uid, {
      path: `/suppliers/${uid}`,
      isPublic: true,
    })

    return { createdCore, createdApp, id: uid }
  }

  return { ensureSupplier }
}
