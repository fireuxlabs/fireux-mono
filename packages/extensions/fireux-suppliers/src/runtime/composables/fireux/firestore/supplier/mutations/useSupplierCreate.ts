import { collection, doc, getDoc } from 'firebase/firestore'
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
import type { ConsoleSupplier, Supplier, SupplierCreateInput } from '../../../../../models/supplier/Supplier.model'

const supplierCollection = 'suppliers'
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
      const rootId = requestedRootId || doc(collection(db, supplierCollection)).id
      const coreRef = doc(db, supplierCollection, rootId)
      const coreSnap = await getDoc(coreRef)

      if (coreSnap.exists()) {
        return {
          id: rootId,
          created: false,
        }
      }

      const payload: SupplierCreateInput = {
        supplier_organization_name: '',
        supplier_headline: '',
        summary: '',
        supplier_bio: '',
        supplier_image: '',
        supplier_product_categories: [] as string[],
        supplier_delivery_areas: [] as string[],
      }

      await setDocument<Supplier>(
        supplierCollection,
        rootId,
        payload as unknown as Supplier,
        {
          creator: true,
        }
      )

      return {
        id: rootId,
        created: true,
      }
    }

    const result = await ensureConsole<ConsoleSupplier>({
      type: 'supplier',
      mode: options.mode ?? 'console',
      existingRootId: requestedRootId || undefined,
      ensureRoot,
      createOverlay: async () => {
        const payload: Omit<ConsoleSupplier, 'created' | 'updated' | 'id'> = {
          admin_ids: uid ? [uid] : ([] as string[]),
          join_requests: [] as string[],
          console_enabled: true,
        }
        return payload as ConsoleSupplier
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
