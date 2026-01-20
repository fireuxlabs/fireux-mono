import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import type { Kitchen, KitchenCreateInput } from '../../../../../../models/objects/kitchen.model'

export const KitchenPayload = {
  id: '',
  name: '',
  formatted_address: '',
  place_image: '',
  website: '',
}

export const KitchenStampOptions = {
  creator: true,
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

    await setDocument<Kitchen>('kitchens', payload.id, payload as Kitchen, {
      creator: true,
    })

    return payload.id
  }

  return { createKitchen }
}
