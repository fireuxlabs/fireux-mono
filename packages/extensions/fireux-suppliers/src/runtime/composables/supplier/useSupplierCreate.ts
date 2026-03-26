import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { SupplierApp, SupplierCore, SupplierCreateInput } from '../../models/supplier/Supplier.model'
import { SUPPLIER_COLLECTION } from './constants'

export type EnsureSupplierOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

export function useSupplierCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const { ensureConsole } = useConsoleEnsure()

  async function ensureSupplier(
    options: EnsureSupplierOptions = {}
  ): Promise<ConsoleEnsureResult> {
    await ensureUser()
    const { uid } = await requireUid()

    const requestedRootId = String(options.existingRootId || '').trim()

    const ensureRoot = async (): Promise<ConsoleRootEnsureResult> => {
      const rootId = requestedRootId || uid
      const coreRef = doc(db, SUPPLIER_COLLECTION, rootId)
      const coreSnap = await getDoc(coreRef)

      if (coreSnap.exists()) {
        return {
          id: rootId,
          created: false,
        }
      }

      const payload: SupplierCreateInput = {
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
      }

      await setDocument<SupplierCore>(
        SUPPLIER_COLLECTION,
        rootId,
        payload as unknown as SupplierCore,
        {
          creator: true,
        }
      )

      return {
        id: rootId,
        created: true,
      }
    }

    const result = await ensureConsole<SupplierApp>({
      type: 'supplier',
      mode: options.mode ?? 'console',
      existingRootId: requestedRootId || undefined,
      ensureRoot,
      createOverlay: async () => {
        const payload: Omit<SupplierApp, 'created' | 'updated' | 'id'> = {
          admin_ids: uid ? [uid] : ([] as string[]),
          join_requests: [] as string[],
          console_enabled: true,
        }
        return payload as SupplierApp
      },
    })

    await upsertSeoIndexDoc('seo_index_suppliers', result.id, {
      path: `/suppliers/${result.id}`,
      isPublic: true,
    })

    return result
  }

  return {
    ensureSupplier,
  }
}
