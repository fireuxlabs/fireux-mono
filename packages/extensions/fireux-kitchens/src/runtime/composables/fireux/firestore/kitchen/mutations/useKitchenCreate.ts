import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed } from 'vue'
import type {
  AppKitchen,
  Kitchen,
  KitchenCreateInput,
} from '../../../../../models/kitchen.model'

const normalizeString = (value: unknown) => String(value || '').trim()
const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error(
      'Missing firebase.simulationDatabaseId for kitchen test-mode writes.'
    )
  }
  return databaseId
}
const resolveTestUserLabel = (displayName: unknown, uid: unknown) => {
  const resolvedDisplayName = normalizeString(displayName)
  if (resolvedDisplayName) return resolvedDisplayName

  const resolvedUid = normalizeString(uid)
  if (!resolvedUid) return 'User'

  return `User ${resolvedUid.slice(0, 6)}`
}

type KitchenTestCreateInput = {
  id?: string
  slug?: string
  name?: string
  subtitle?: string
  image_url?: string
}

export const KitchenPayload = {
  id: '',
}

export const KitchenStampOptions = {
  creator: false,
} as const

export type KitchenCreateOptions = {
  collectionPath?: string
  test?: boolean
  ensurePlace?: boolean
}

export type EnsureKitchenOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

export function useKitchenCreate(options: KitchenCreateOptions = {}) {
  const db = useFirestore()
  const simulationDatabaseId = computed(
    () => requireSimulationDatabaseId()
  )
  const simulationDb = useFirestore(simulationDatabaseId)
  const { setDocument } = useFirestoreCreate()
  const { setDocument: setSimulationDocument } = useFirestoreCreate({
    databaseId: simulationDatabaseId,
  })
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const { ensurePlaceExists } = usePlaceSave()
  const { ensureConsole } = useConsoleEnsure()
  const { uid, currentUser } = useAuth()
  const collectionPath =
    options.test ? 'kitchens' : options.collectionPath ?? 'kitchens'
  const isTestKitchenCollection = options.test === true
  const activeDb = isTestKitchenCollection ? simulationDb : db
  const activeSetDocument = isTestKitchenCollection
    ? setSimulationDocument
    : setDocument
  const shouldEnsurePlace = options.ensurePlace ?? !isTestKitchenCollection

  async function createTestKitchen(
    input: KitchenTestCreateInput = {}
  ): Promise<ConsoleRootEnsureResult> {
    const testId = normalizeString(input.id) || normalizeString(uid.value)
    const userLabel =
      normalizeString(input.subtitle) ||
      resolveTestUserLabel(currentUser.value?.displayName, uid.value)
    const name = normalizeString(input.name) || 'Test Kitchen'
    const imageUrl = normalizeString(input.image_url)

    if (!testId) {
      throw new Error('Test kitchen id is required')
    }

    const ref = doc(simulationDb, 'kitchens', testId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { id: testId, created: false }
    }

    const slug = normalizeSlug(input.slug) || 'test-kitchen'

    if (!slug) {
      throw new Error('Test kitchen slug is required')
    }

    await setSimulationDocument<Partial<Kitchen> & {
      slug?: string
      name?: string
      short_address?: string
      image_url?: string
      simulation_kind?: string
      can_write?: boolean
      is_test_kitchen?: boolean
    }>(
      'kitchens',
      testId,
      {
        place_id: testId,
        slug,
        name,
        short_address: userLabel,
        image_url: imageUrl,
        simulation_kind: 'test',
        can_write: true,
        is_test_kitchen: true,
      },
      {
        creator: false,
      }
    )

    return { id: testId, created: true }
  }

  async function ensureKitchenRoot(
    input: KitchenCreateInput & { place?: PlaceUpsertInput }
  ): Promise<ConsoleRootEnsureResult> {
    const resolvedId = String(input?.id || '').trim()
    if (!resolvedId) {
      throw new Error('Kitchen id is required')
    }

    const place = input?.place

    if (shouldEnsurePlace) {
      if (place) {
        const ok = await ensurePlaceExists({
          ...place,
          id: resolvedId,
        })
        if (!ok) {
          throw new Error(`Unable to resolve place for kitchen "${resolvedId}"`)
        }
      } else {
        const placeSnap = await getDoc(doc(activeDb, 'places', resolvedId))
        if (!placeSnap.exists()) {
          throw new Error(
            `Kitchen "${resolvedId}" requires an existing place or a place payload`
          )
        }
      }
    }

    const explicitName = normalizeString((input as any)?.name)
    const explicitShortName = normalizeString((input as any)?.short_name)
    const explicitShortAddress = normalizeString((input as any)?.short_address)
    const explicitImageUrl = normalizeString((input as any)?.image_url)
    const defaultTestName = isTestKitchenCollection
      ? `${resolveTestUserLabel(currentUser.value?.displayName, uid.value)} Test Kitchen`
      : ''

    const resolvedPayload: Record<string, unknown> = {
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      place_id: resolvedId,
    }

    if (isTestKitchenCollection) {
      resolvedPayload.is_test_kitchen = true
      resolvedPayload.simulation_kind = 'test'
      resolvedPayload.can_write = true
    }

    const resolvedName =
      isTestKitchenCollection && (!explicitName || explicitName === normalizeString(uid.value))
        ? defaultTestName
        : explicitName
    if (resolvedName) {
      resolvedPayload.name = resolvedName
    }

    if (explicitShortName) {
      resolvedPayload.short_name = explicitShortName
    }

    if (explicitShortAddress) {
      resolvedPayload.short_address = explicitShortAddress
    }

    if (explicitImageUrl) {
      resolvedPayload.image_url = explicitImageUrl
    }

    const ref = doc(activeDb, collectionPath, resolvedId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      if (!isTestKitchenCollection) {
        await upsertSeoIndexDoc('seo_index_kitchens', resolvedId, {
          path: `/kitchens/${resolvedId}`,
          isPublic: true,
        })
      }
      return { id: resolvedId, created: false }
    }

    await activeSetDocument<Kitchen>(
      collectionPath,
      resolvedId,
      resolvedPayload as Kitchen,
      {
        creator: false,
      }
    )
    if (!isTestKitchenCollection) {
      await upsertSeoIndexDoc('seo_index_kitchens', resolvedId, {
        path: `/kitchens/${resolvedId}`,
        isPublic: true,
      })
    }

    return { id: resolvedId, created: true }
  }

  async function runKitchenCreate(
    input: KitchenCreateInput & { place?: PlaceUpsertInput },
    ensureOptions: EnsureKitchenOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<ConsoleEnsureResult> {
    const resolvedId = String(
      ensureOptions.existingRootId || input?.id || ''
    ).trim()

    return ensureConsole<AppKitchen>({
      type: 'kitchen',
      mode: ensureOptions.mode ?? defaultMode,
      ensureRoot: async () =>
        ensureKitchenRoot({
          ...input,
          id: resolvedId,
        }),
      createOverlay: async () =>
        ({
          ...(uid.value ? { team_ids: [String(uid.value).trim()] } : {}),
        }) as AppKitchen,
    })
  }

  async function createKitchen(
    input: KitchenCreateInput & { place?: PlaceUpsertInput },
    ensureOptions: EnsureKitchenOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runKitchenCreate(input, ensureOptions, 'public')
  }

  async function ensureKitchen(
    input: KitchenCreateInput & { place?: PlaceUpsertInput },
    ensureOptions: EnsureKitchenOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runKitchenCreate(input, ensureOptions, 'console')
  }

  return { createKitchen, ensureKitchen, createTestKitchen }
}
