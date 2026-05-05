import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed } from 'vue'
import {
  resolveTestKitchenName,
  resolveTestKitchenShortAddress,
  resolveTestKitchenSlug,
} from '../../../app/kitchens/testKitchenIdentity'
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
type KitchenTestCreateInput = {
  id?: string
  name?: string
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
  const { updateDocument: updateSimulationDocument } = useFirestoreUpdate({
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
    const name =
      normalizeString(input.name) ||
      resolveTestKitchenName(currentUser.value?.displayName, uid.value)
    const imageUrl =
      normalizeString(input.image_url) ||
      normalizeString(currentUser.value?.photoURL)

    if (!testId) {
      throw new Error('Test kitchen id is required')
    }

    const ref = doc(simulationDb, 'kitchens', testId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const existingImageUrl = normalizeString(snap.data()?.image_url)
      await updateSimulationDocument<Kitchen>('kitchens', testId, {
        name,
        slug: resolveTestKitchenSlug(currentUser.value?.displayName, uid.value),
        short_address: resolveTestKitchenShortAddress(),
        ...(existingImageUrl ? {} : { image_url: imageUrl }),
      })
      return { id: testId, created: false }
    }

    const slug = resolveTestKitchenSlug(currentUser.value?.displayName, uid.value)

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
        short_address: resolveTestKitchenShortAddress(),
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
    const explicitFormattedAddress = normalizeString((input as any)?.formatted_address)
    const explicitImageUrl =
      normalizeString((input as any)?.image_url) ||
      (isTestKitchenCollection
        ? normalizeString(currentUser.value?.photoURL)
        : '')
    const explicitImageShade = normalizeString((input as any)?.image_shade)
    const explicitSlug = normalizeString((input as any)?.slug)
    const explicitSource = normalizeString((input as any)?.source)
    const defaultTestName = isTestKitchenCollection
      ? resolveTestKitchenName(currentUser.value?.displayName, uid.value)
      : ''
    const placeName = normalizeString((place as any)?.name)
    const placeShortName = normalizeString((place as any)?.short_name)
    const placeShortAddress = normalizeString((place as any)?.short_address)
    const placeFormattedAddress = normalizeString((place as any)?.formatted_address)
    const placeImageUrl = normalizeString((place as any)?.image_url)
    const placeImageShade = normalizeString((place as any)?.image_shade)
    const placeSlug = normalizeString((place as any)?.slug)
    const placeSource = normalizeString((place as any)?.source)
    const placeLat = Number((place as any)?.lat)
    const placeLng = Number((place as any)?.lng)

    const resolvedPayload: Record<string, unknown> = {
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      place_id: resolvedId,
      is_test_kitchen: false,
    }

    if (isTestKitchenCollection) {
      resolvedPayload.is_test_kitchen = true
      resolvedPayload.simulation_kind = 'test'
      resolvedPayload.can_write = true
    }

    const resolvedName =
      isTestKitchenCollection && (!explicitName || explicitName === normalizeString(uid.value))
        ? defaultTestName
        : explicitName || placeName
    if (resolvedName) {
      resolvedPayload.name = resolvedName
    }

    const resolvedShortName = explicitShortName || placeShortName
    if (resolvedShortName) {
      resolvedPayload.short_name = resolvedShortName
    }

    const resolvedShortAddress =
      explicitShortAddress ||
      placeShortAddress ||
      (isTestKitchenCollection ? resolveTestKitchenShortAddress() : '')

    if (resolvedShortAddress) {
      resolvedPayload.short_address = resolvedShortAddress
    }

    const resolvedFormattedAddress = explicitFormattedAddress || placeFormattedAddress
    if (resolvedFormattedAddress) {
      resolvedPayload.formatted_address = resolvedFormattedAddress
    }

    if (Number.isFinite(placeLat)) {
      resolvedPayload.lat = placeLat
    }

    if (Number.isFinite(placeLng)) {
      resolvedPayload.lng = placeLng
    }

    const resolvedImageUrl = explicitImageUrl || placeImageUrl
    if (resolvedImageUrl) {
      resolvedPayload.image_url = resolvedImageUrl
    }

    const resolvedImageShade = explicitImageShade || placeImageShade
    if (resolvedImageShade) {
      resolvedPayload.image_shade = resolvedImageShade
    }

    const resolvedSlug = explicitSlug || placeSlug
    if (resolvedSlug) {
      resolvedPayload.slug = resolvedSlug
    }

    const resolvedSource = explicitSource || placeSource
    if (resolvedSource) {
      resolvedPayload.source = resolvedSource
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
