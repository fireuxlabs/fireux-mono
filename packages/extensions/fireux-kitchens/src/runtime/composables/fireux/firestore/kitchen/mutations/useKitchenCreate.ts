// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: link Kitchens to Place without copying Place presentation or operational defaults.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit Kitchen App support creation results.
import { deleteField, doc, getDoc, updateDoc } from 'firebase/firestore'
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
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type {
  AppKitchen,
  Kitchen,
  KitchenCreateInput,
} from '../../../../../models/kitchen.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { readWeekdayTimeWindowsConfig } from '../../../../../utils/weekday-time'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map(normalizeString).filter(Boolean)
    : []
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

function compactRecord(source: unknown): Record<string, unknown> {
  if (!isRecord(source)) return {}

  return Object.fromEntries(
    Object.entries(source)
      .map(([key, value]) => {
        if (typeof value === 'string') return [key, value.trim()]
        if (Array.isArray(value)) {
          const items = value
            .map((item) => typeof item === 'string' ? item.trim() : item)
            .filter((item) => item !== '' && item !== null && item !== undefined)
          return [key, items]
        }
        if (isRecord(value)) return [key, compactRecord(value)]
        return [key, value]
      })
      .filter(([, value]) => {
        if (typeof value === 'string') return Boolean(value)
        if (Array.isArray(value)) return value.length > 0
        if (isRecord(value)) return Object.keys(value).length > 0
        return value !== null && value !== undefined
      })
  )
}

function putString(target: Record<string, unknown>, key: string, value: unknown) {
  const next = normalizeString(value)
  if (next) target[key] = next
}

function putStringArray(
  target: Record<string, unknown>,
  key: string,
  value: unknown
) {
  const next = normalizeStringArray(value)
  if (next.length) target[key] = next
}
type KitchenPlaceDraft = Record<string, unknown> & {
  id?: string
  name?: string
  short_name?: string
  slug?: string
}
type KitchenCreateDraft = KitchenCreateInput & {
  display_name?: string
  display_image_url?: string
  menu_currency_format?: CurrencyDisplayFormat
  menu_show_currency?: boolean
  place?: KitchenPlaceDraft
}

export type KitchenCreateResult = ConsoleCreateResult & {
  slug?: string
}
type KitchenRootCreateResult = ConsoleRootCreateResult & {
  slug?: string
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

  async function normalizeKitchenRootScope(kitchenId: string) {
    const id = normalizeString(kitchenId)
    if (!id) return

    const ref = doc(db, collectionPath, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return

    const data = snap.data() as Record<string, unknown>
    const appScope = isRecord(data.app_scope) ? data.app_scope : {}
    const state = normalizeString(data.app_scope_state || appScope.state)
    const appId = normalizeString(data.app_scope_app_id || appScope.app_id)
    if (!state) return

    await updateDoc(ref, {
      app_scope: {
        state,
        ...(appId ? { app_id: appId } : {}),
      },
      app_scope_state: deleteField(),
      app_scope_app_id: deleteField(),
    })
  }

  function createKitchenPayload(
    _id: string,
    input: KitchenCreateDraft
  ): Partial<Kitchen> {
    const place = input.place ?? {}
    const identity = (input.identity ?? {}) as Partial<Kitchen['identity']>
    const menus = (input.menus ?? {}) as Partial<Kitchen['menus']>
    const placeName = normalizeString(place.name || place.short_name)
    const displayName = normalizeString(
      identity.display_name || input.display_name
    )
    const displayImageUrl = normalizeString(
      identity.image_url || input.display_image_url
    )
    const tagline = normalizeString(identity.tagline)
    const placeId = normalizeString(input.place_id || place.id)
    const claimedBy = normalizeString(input.claimed_by || uid.value)
    const formattedAddress = normalizeString(input.formatted_address)
    const shortAddress = normalizeString(input.short_address)
    const coverImage = normalizeString(input.cover_image)
    const slug = normalizeSlug(
      input.slug ||
      place.slug ||
      displayName ||
      placeName
    )
    const style = menus.style
    if (!placeId) throw new Error('A linked Place is required to create a Kitchen.')

    const appScopePayload: Record<string, unknown> = {
      state: 'root_only',
    }
    const identityPayload: Record<string, unknown> = {}
    const menusPayload: Record<string, unknown> = {}
    const currencyFormat = normalizeString(
      menus.currency_format || input.menu_currency_format
    )
    const showCurrency =
      typeof menus.show_currency === 'boolean'
        ? menus.show_currency
        : input.menu_show_currency
    const compactStyle = compactRecord(style)
    const inputHours = readWeekdayTimeWindowsConfig(
      input.orders?.operation_hours
    )
    const ordersPayload = compactRecord(input.orders)
    delete ordersPayload.operation_hours
    if (inputHours.source === 'custom' && inputHours.windows.length) {
      ordersPayload.operation_hours = inputHours
    }

    putString(identityPayload, 'display_name', displayName)
    putString(identityPayload, 'tagline', tagline)
    putString(identityPayload, 'image_url', displayImageUrl)
    putStringArray(identityPayload, 'gallery', identity.gallery)

    if (currencyFormat && currencyFormat !== 'dash') {
      menusPayload.currency_format = currencyFormat
    }
    if (showCurrency === false) menusPayload.show_currency = false
    if (Object.keys(compactStyle).length) menusPayload.style = compactStyle

    const payload: Partial<Kitchen> = {
      app_scope: appScopePayload as Kitchen['app_scope'],
      place_id: placeId,
    }

    if (Object.keys(identityPayload).length) {
      payload.identity = identityPayload as Kitchen['identity']
    }
    if (Object.keys(menusPayload).length) {
      payload.menus = menusPayload as Kitchen['menus']
    }
    if (Object.keys(ordersPayload).length) {
      payload.orders = ordersPayload as Kitchen['orders']
    }
    if (claimedBy) payload.claimed_by = claimedBy
    if (formattedAddress) payload.formatted_address = formattedAddress
    if (shortAddress) payload.short_address = shortAddress
    if (coverImage) payload.cover_image = coverImage
    if (slug) payload.slug = slug

    return payload
  }

  async function createKitchenRoot(
    input: KitchenCreateDraft
  ): Promise<KitchenRootCreateResult> {
    const id = normalizeString(input?.id || input?.place?.id)
    if (!id) {
      throw new Error('Kitchen id is required')
    }

    const ref = doc(db, collectionPath, id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const existingSlug = normalizeString(snap.data()?.slug)
      return { id, created: false, ...(existingSlug ? { slug: existingSlug } : {}) }
    }

    const payload = createKitchenPayload(id, input)

    await setDocument<Partial<Kitchen>>(collectionPath, id, payload, {
      creator: true,
    })

    return {
      id,
      created: true,
      ...(payload.slug ? { slug: normalizeString(payload.slug) } : {}),
    }
  }

  async function runKitchenCreate(
    input: KitchenCreateDraft = {},
    createOptions: KitchenCreateModeOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<KitchenCreateResult> {
    const existingRootId = normalizeString(createOptions.existingRootId)

    const result = await createConsole<AppKitchen>({
      type: 'kitchen',
      mode: createOptions.mode ?? defaultMode,
      existingRootId: existingRootId || null,
      createRoot: async () => createKitchenRoot(input),
      createAppSupport: async () =>
        ({
          operator_ids: uid.value ? [normalizeString(uid.value)] : [],
          team_ids: uid.value ? [normalizeString(uid.value)] : [],
          join_requests: [],
        }) as unknown as AppKitchen,
    })
    await normalizeKitchenRootScope(result.id)

    return result
  }

  async function createKitchen(
    input: KitchenCreateDraft = {},
    _createOptions: KitchenCreateModeOptions = {}
  ): Promise<KitchenCreateResult> {
    const root = await createKitchenRoot(input)
    return {
      id: root.id,
      createdRoot: root.created,
      createdAppSupport: false,
      ...('slug' in root && root.slug ? { slug: normalizeString(root.slug) } : {}),
    }
  }

  async function createKitchenConsole(
    input: KitchenCreateDraft = {},
    createOptions: KitchenCreateModeOptions = {}
  ): Promise<KitchenCreateResult> {
    return runKitchenCreate(input, createOptions, 'console')
  }

  return { createPlan: KitchenCreatePlan, createKitchen, createKitchenConsole }
}
