import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
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
}

export function useKitchenCreate(options: KitchenCreateOptions = {}) {
  const { setDocument } = useFirestoreCreate()
  const db = useFirestore()
  const collectionPath = options.test ? 'test-kitchens' : options.collectionPath ?? 'kitchens'

  async function createKitchen(
    input: KitchenCreateInput & { place?: PlaceUpsertInput }
  ): Promise<string> {
    if (!input?.id) {
      throw new Error('Kitchen id is required')
    }

    const { place, ...payload } = input
    void place

    const resolvedPayload = options.test
      ? { ...payload, is_test_kitchen: true }
      : payload

    const ref = doc(db, collectionPath, resolvedPayload.id)
    const snap = await getDoc(ref)
    if (snap.exists()) return resolvedPayload.id

    await setDocument<KitchenCollection>(
      collectionPath,
      resolvedPayload.id,
      resolvedPayload as KitchenCollection,
      {
        creator: false,
      }
    )

    return resolvedPayload.id
  }

  return { createKitchen }
}
