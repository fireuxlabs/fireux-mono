import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
  AppKitchen,
  Kitchen,
  KitchenCreateInput,
} from '../../../../../models/kitchen.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenCreateDraft = Partial<KitchenCreateInput> & Record<string, unknown>

export type KitchenCreateOptions = {
  collectionPath?: string
}

export type EnsureKitchenOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

export const KitchenCreatePlan = defineFireuxCreatePlan({
  family: 'with_ensure',
})

export function useKitchenCreate(options: KitchenCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureConsole } = useConsoleEnsure()
  const { uid } = useAuth()
  const collectionPath = normalizeString(options.collectionPath || 'kitchens') || 'kitchens'

  async function ensureKitchenRoot(
    input: KitchenCreateDraft
  ): Promise<ConsoleRootEnsureResult> {
    const id = normalizeString(input?.id) || normalizeString(uid.value)
    if (!id) {
      throw new Error('Kitchen id is required')
    }

    const ref = doc(db, collectionPath, id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { id, created: false }
    }

    const payload: Partial<Kitchen> = {
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      operator_ids: uid.value ? [normalizeString(uid.value)] : [],
      team_ids: uid.value ? [normalizeString(uid.value)] : [],
    }

    await setDocument<Partial<Kitchen>>(collectionPath, id, payload, {
      creator: true,
      app: true,
    })

    return { id, created: true }
  }

  async function runKitchenCreate(
    input: KitchenCreateDraft = {},
    ensureOptions: EnsureKitchenOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<ConsoleEnsureResult> {
    const existingRootId = normalizeString(ensureOptions.existingRootId)

    return ensureConsole<AppKitchen>({
      type: 'kitchen',
      mode: ensureOptions.mode ?? defaultMode,
      existingRootId: existingRootId || null,
      ensureRoot: async () => ensureKitchenRoot(input),
      createOverlay: async () =>
        ({
          operator_ids: uid.value ? [normalizeString(uid.value)] : [],
          team_ids: uid.value ? [normalizeString(uid.value)] : [],
          join_requests: [],
        }) as AppKitchen,
    })
  }

  async function createKitchen(
    input: KitchenCreateDraft = {},
    ensureOptions: EnsureKitchenOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runKitchenCreate(input, ensureOptions, 'public')
  }

  async function ensureKitchen(
    input: KitchenCreateDraft = {},
    ensureOptions: EnsureKitchenOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runKitchenCreate(input, ensureOptions, 'console')
  }

  return { createPlan: KitchenCreatePlan, createKitchen, ensureKitchen }
}
