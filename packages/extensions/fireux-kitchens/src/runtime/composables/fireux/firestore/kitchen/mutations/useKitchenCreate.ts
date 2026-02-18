import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { useFirestore } from 'vuefire'
import type { KitchenCollection, KitchenCreateInput } from '../../../../../models/kitchen.model'

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

export function useKitchenCreate(options: KitchenCreateOptions = {}) {
  const { setDocument } = useFirestoreCreate()
  const { ensurePlaceExists } = usePlaceSave()
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
    if (snap.exists()) return resolvedId

    await setDocument<KitchenCollection>(
      collectionPath,
      resolvedId,
      resolvedPayload as KitchenCollection,
      {
        creator: false,
      }
    )

    return resolvedId
  }

  return { createKitchen }
}
