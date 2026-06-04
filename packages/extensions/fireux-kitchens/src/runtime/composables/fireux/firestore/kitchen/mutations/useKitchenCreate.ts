import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
  ConsoleRootCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useConsoleCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type {
  AppKitchen,
  Kitchen,
  KitchenCreateInput,
} from '../../../../../models/kitchen.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type KitchenPlaceDraft = Record<string, unknown> & {
  id?: string
  name?: string
  short_name?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
  place_image?: string
  slug?: string
}
type KitchenCreateDraft = KitchenCreateInput & {
  place?: KitchenPlaceDraft
}

export type KitchenCreateOptions = {
  collectionPath?: string
}

export type KitchenCreateModeOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

export const KitchenCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function useKitchenCreate(options: KitchenCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { createConsole } = useConsoleCreate()
  const { uid } = useAuth()
  const collectionPath =
    normalizeString(options.collectionPath || KitchenStorage.rootCollection) ||
    KitchenStorage.rootCollection

  function createKitchenPayload(
    id: string,
    input: KitchenCreateDraft
  ): Partial<Kitchen> {
    const place = input.place ?? {}
    const placeName = normalizeString(place.name || place.short_name)
    const displayName = normalizeString(input.display_name)
    const displayImageUrl = normalizeString(input.display_image_url)
    const slug = normalizeSlug(
      input.slug ||
      place.slug ||
      displayName ||
      placeName
    )
    const payload: Partial<Kitchen> = {
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      place_id: normalizeString(input.place_id || place.id || id) || id,
      show: false,
      is_test_kitchen: false,
      menu_currency_format: input.menu_currency_format || 'dash',
      menu_show_currency: input.menu_show_currency !== false,
      menu_available: true,
    }

    if (slug) payload.slug = slug
    if (displayName) payload.display_name = displayName
    if (displayImageUrl) payload.display_image_url = displayImageUrl

    return payload
  }

  async function createKitchenRoot(
    input: KitchenCreateDraft
  ): Promise<ConsoleRootCreateResult> {
    const id = normalizeString(input?.id || input?.place?.id)
    if (!id) {
      throw new Error('Kitchen id is required')
    }

    const ref = doc(db, collectionPath, id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { id, created: false }
    }

    const payload = createKitchenPayload(id, input)

    await setDocument<Partial<Kitchen>>(collectionPath, id, payload, {
      creator: true,
    })

    return { id, created: true }
  }

  async function runKitchenCreate(
    input: KitchenCreateDraft = {},
    createOptions: KitchenCreateModeOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<ConsoleCreateResult> {
    const existingRootId = normalizeString(createOptions.existingRootId)

    return createConsole<AppKitchen>({
      type: 'kitchen',
      mode: createOptions.mode ?? defaultMode,
      existingRootId: existingRootId || null,
      createRoot: async () => createKitchenRoot(input),
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
    _createOptions: KitchenCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    const root = await createKitchenRoot(input)
    return {
      id: root.id,
      createdRoot: root.created,
      createdOverlay: false,
    }
  }

  async function createKitchenConsole(
    input: KitchenCreateDraft = {},
    createOptions: KitchenCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    return runKitchenCreate(input, createOptions, 'console')
  }

  return { createPlan: KitchenCreatePlan, createKitchen, createKitchenConsole }
}
