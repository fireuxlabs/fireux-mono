import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type {
  KitchenApp,
  KitchenCollection,
  KitchenCreateInput,
} from '../../../../../models/kitchen.model'

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
  const { setDocument } = useFirestoreCreate()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const { ensurePlaceExists } = usePlaceSave()
  const { ensureConsole } = useConsoleEnsure()
  const { uid } = useAuth()
  const db = useFirestore()
  const collectionPath =
    options.test ? 'test-kitchens' : options.collectionPath ?? 'kitchens'
  const isTestKitchenCollection =
    options.test === true || collectionPath === 'test-kitchens'
  const shouldEnsurePlace = options.ensurePlace ?? !isTestKitchenCollection

  async function createKitchen(
    input: KitchenCreateInput & { place?: PlaceUpsertInput }
  ): Promise<string> {
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
        const placeSnap = await getDoc(doc(db, 'places', resolvedId))
        if (!placeSnap.exists()) {
          throw new Error(
            `Kitchen "${resolvedId}" requires an existing place or a place payload`
          )
        }
      }
    }

    const resolvedPayload: KitchenCollection = {
      id: resolvedId,
      is_test_kitchen: isTestKitchenCollection,
    } as KitchenCollection

    const ref = doc(db, collectionPath, resolvedId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await upsertSeoIndexDoc('seo_index_kitchens', resolvedId, {
        path: `/kitchens/${resolvedId}`,
        isPublic: true,
      })
      return resolvedId
    }

    await setDocument<KitchenCollection>(
      collectionPath,
      resolvedId,
      resolvedPayload as KitchenCollection,
      {
        creator: false,
      }
    )
    await upsertSeoIndexDoc('seo_index_kitchens', resolvedId, {
      path: `/kitchens/${resolvedId}`,
      isPublic: true,
    })

    return resolvedId
  }

  async function ensureKitchen(
    input: KitchenCreateInput & { place?: PlaceUpsertInput },
    ensureOptions: EnsureKitchenOptions = {}
  ): Promise<ConsoleEnsureResult> {
    const resolvedId = String(
      ensureOptions.existingRootId || input?.id || ''
    ).trim()

    const ensureRoot = async (): Promise<ConsoleRootEnsureResult> => {
      if (!resolvedId) {
        throw new Error('Kitchen id is required')
      }

      const rootRef = doc(db, collectionPath, resolvedId)
      const rootSnap = await getDoc(rootRef)
      if (rootSnap.exists()) {
        return { id: resolvedId, created: false }
      }

      await createKitchen({
        ...input,
        id: resolvedId,
      })

      return { id: resolvedId, created: true }
    }

    return ensureConsole<KitchenApp>({
      type: 'kitchen',
      mode: ensureOptions.mode ?? 'console',
      ensureRoot,
      createOverlay: async () =>
        ({
          admin_ids: uid.value ? [uid.value] : ([] as string[]),
          join_requests: [] as string[],
          console_enabled: true,
        }) as KitchenApp,
    })
  }

  return { createKitchen, ensureKitchen }
}
