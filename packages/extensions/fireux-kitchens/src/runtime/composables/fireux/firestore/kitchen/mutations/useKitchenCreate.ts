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
  currency_code?: string
  currency_format?: Kitchen['currency_format']
}
type KitchenCreateDraft = Partial<KitchenCreateInput> & {
  id?: string
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
    const name = normalizeString(input.name || place.name || place.short_name)
    const shortAddress = normalizeString(input.short_address || place.short_address)
    const formattedAddress = normalizeString(
      input.formatted_address || place.formatted_address
    )
    const imageUrl = normalizeString(
      input.image_url || place.image_url || place.place_image
    )
    const slug = normalizeSlug(
      input.slug ||
      place.slug ||
      [name, shortAddress || formattedAddress].filter(Boolean).join(' ')
    )
    const payload: Partial<Kitchen> = {
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      place_id: normalizeString(input.place_id || place.id || id) || id,
      show: false,
      is_test_kitchen: false,
      currency_code: normalizeString(input.currency_code) || 'CHF',
      currency_format: input.currency_format || 'dash',
    }

    if (slug) payload.slug = slug
    if (name) {
      payload.name = name
      payload.short_name = normalizeString(input.short_name || place.short_name) || name
    }
    if (shortAddress) payload.short_address = shortAddress
    if (formattedAddress) payload.formatted_address = formattedAddress
    if (imageUrl) payload.image_url = imageUrl

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
