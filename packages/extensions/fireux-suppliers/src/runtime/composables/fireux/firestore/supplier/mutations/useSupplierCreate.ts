import { collection, doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { AppSupplier, Supplier, SupplierCreateInput } from '../../../../../models/supplier/Supplier.model'

const normalizeString = (value: unknown) => String(value || '').trim()
const resolveTestUserLabel = (displayName: unknown, uid: unknown) => {
  const resolvedDisplayName = normalizeString(displayName)
  if (resolvedDisplayName) return resolvedDisplayName

  const resolvedUid = normalizeString(uid)
  if (!resolvedUid) return 'User'

  return `User ${resolvedUid.slice(0, 6)}`
}

export type SupplierCreateOptions = {
  collectionPath?: string
  test?: boolean
}

export type EnsureSupplierOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

type SupplierTestCreateInput = {
  id?: string
  name?: string
  subtitle?: string
  image_url?: string
}

export function useSupplierCreate(options: SupplierCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const { ensureConsole } = useConsoleEnsure()
  const { currentUser } = useAuth()
  const supplierCollection =
    options.test === true
      ? 'test-suppliers'
      : String(options.collectionPath || 'suppliers').trim() || 'suppliers'
  const isTestSupplierCollection =
    options.test === true || supplierCollection === 'test-suppliers'

  async function createTestSupplier(
    input: SupplierTestCreateInput = {}
  ): Promise<ConsoleRootEnsureResult> {
    const { uid } = await requireUid()
    const id = normalizeString(input.id) || normalizeString(uid)
    const userLabel =
      normalizeString(input.subtitle) ||
      resolveTestUserLabel(currentUser.value?.displayName, uid)
    const name = normalizeString(input.name) || 'Test Supplier'
    const imageUrl = normalizeString(input.image_url)

    if (!id) {
      throw new Error('Test supplier id is required')
    }

    const ref = doc(db, 'test-suppliers', id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { id, created: false }
    }

    const payload: Partial<Supplier> = {
      supplier_organization_name: name,
      supplier_headline: userLabel,
    }

    if (imageUrl) {
      payload.supplier_image = imageUrl
    }

    await setDocument<Partial<Supplier>>(
      'test-suppliers',
      id,
      payload,
      {
        creator: true,
      }
    )

    return { id, created: true }
  }

  async function runSupplierCreate(
    options: EnsureSupplierOptions = {},
    defaultMode: ConsoleCreateMode
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

      const defaultName = isTestSupplierCollection
        ? `${resolveTestUserLabel(currentUser.value?.displayName, uid)} Test Supplier`
        : ''

      const payload: SupplierCreateInput = {
        company_id: '',
        supplier_organization_name: defaultName,
        supplier_headline: '',
        summary: '',
        supplier_bio: '',
        supplier_image: '',
        supplier_product_categories: [] as string[],
        supplier_delivery_areas: [] as string[],
        state: 'public',
        catalogue_state: 'public_only',
        linked_ingredient_ids: [] as string[],
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

    const result = await ensureConsole<AppSupplier>({
      type: 'supplier',
      mode: options.mode ?? defaultMode,
      ensureRoot,
      createOverlay: async () => {
        const payload: Omit<AppSupplier, 'created' | 'updated' | 'id'> = {
          team_ids: uid ? [uid] : ([] as string[]),
          join_requests: [] as string[],
        }
        return payload as AppSupplier
      },
    })

    if (!isTestSupplierCollection) {
      await upsertSeoIndexDoc('seo_index_suppliers', result.id, {
        path: `/suppliers/${result.id}`,
        isPublic: true,
      })
    }

    return result
  }

  async function createSupplier(
    options: EnsureSupplierOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runSupplierCreate(options, 'public')
  }

  async function ensureSupplier(
    options: EnsureSupplierOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runSupplierCreate(options, 'console')
  }

  return {
    createSupplier,
    ensureSupplier,
    createTestSupplier,
  }
}
