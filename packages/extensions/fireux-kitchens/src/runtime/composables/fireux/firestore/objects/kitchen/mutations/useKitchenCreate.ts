import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import type { KitchenCollection, KitchenCreateInput } from '../../../../../../models/objects/kitchen.model'

export const KitchenPayload = {
  id: '',
  website: '',
}

export const KitchenStampOptions = {
  creator: false,
} as const

export function useKitchenCreate() {
  const { setDocument } = useFirestoreCreate()

  async function createKitchen(
    input: KitchenCreateInput & { place?: PlaceUpsertInput }
  ): Promise<string> {
    if (!input?.id) {
      throw new Error('Kitchen id is required')
    }

    const { place, ...payload } = input
    void place

    await setDocument<KitchenCollection>('kitchens', payload.id, payload as KitchenCollection, {
      creator: false,
    })

    return payload.id
  }

  return { createKitchen }
}
