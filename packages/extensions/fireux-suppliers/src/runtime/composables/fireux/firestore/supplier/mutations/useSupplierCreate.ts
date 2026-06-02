import { collection, doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
  ConsoleRootCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
import { useConsoleCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  SupplierStorage,
  type AppSupplier,
  type Supplier,
  type SupplierCreateInput,
} from '../../../../../models/supplier/Supplier.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()
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

export type SupplierCreateModeOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

type SupplierTestCreateInput = {
  id?: string
  name?: string
  subtitle?: string
  image_url?: string
}

export const SupplierCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function useSupplierCreate(options: SupplierCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { createUser } = useUserCreate()
  const { createConsole } = useConsoleCreate()
  const { currentUser } = useAuth()
  const supplierCollection =
    options.test === true
      ? 'test-suppliers'
      : normalizeString(options.collectionPath || SupplierStorage.rootCollection) ||
        SupplierStorage.rootCollection
  const isTestSupplierCollection =
    options.test === true || supplierCollection === 'test-suppliers'

  async function createTestSupplier(
    input: SupplierTestCreateInput = {}
  ): Promise<ConsoleRootCreateResult> {
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
      slug: normalizeSlug(name),
      supplier_organization_name: name,
      supplier_headline: userLabel,
      operator_ids: [id],
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

  async function createSupplierRoot(
    options: SupplierCreateModeOptions = {}
  ): Promise<ConsoleRootCreateResult> {
    await createUser()
    const { uid } = await requireUid()
    const requestedRootId = normalizeString(options.existingRootId)
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
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      company_id: '',
      slug: defaultName ? normalizeSlug(defaultName) : '',
      supplier_organization_name: defaultName,
      supplier_headline: '',
      summary: '',
      supplier_bio: '',
      supplier_image: '',
      supplier_item_categories: [] as string[],
      supplier_delivery_areas: [] as string[],
      state: 'public',
      catalogue_state: 'public_only',
      linked_ingredient_ids: [] as string[],
      hello: '',
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

  async function runSupplierConsoleCreate(
    options: SupplierCreateModeOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<ConsoleCreateResult> {
    await createUser()
    const { uid } = await requireUid()

    const createRoot = async (): Promise<ConsoleRootCreateResult> => {
      return createSupplierRoot(options)
    }

    const result = await createConsole<AppSupplier>({
      type: 'supplier',
      mode: options.mode ?? defaultMode,
      createRoot,
      createOverlay: async () => {
        const payload: Omit<AppSupplier, 'created' | 'updated' | 'id'> = {
          operator_ids: uid ? [uid] : ([] as string[]),
          team_ids: uid ? [uid] : ([] as string[]),
          join_requests: [] as string[],
        }
        return payload as AppSupplier
      },
    })

    return result
  }

  async function createSupplier(
    options: SupplierCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    const root = await createSupplierRoot(options)
    return {
      id: root.id,
      createdRoot: root.created,
      createdOverlay: false,
    }
  }

  async function createSupplierConsole(
    options: SupplierCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    return runSupplierConsoleCreate(options, 'console')
  }

  return {
    createPlan: SupplierCreatePlan,
    createSupplier,
    createSupplierConsole,
    createTestSupplier,
  }
}
