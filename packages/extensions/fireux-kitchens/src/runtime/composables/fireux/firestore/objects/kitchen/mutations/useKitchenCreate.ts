import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { Kitchen, KitchenCreateInput } from '../../../../../../models/objects/kitchen.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenCreate() {
  const { setDocument } = useFirestoreManager()

  const createKitchen = async (
    input: KitchenCreateInput & { place: PlaceUpsertInput }
  ): Promise<string> => {
    const id = String(input?.id ?? '').trim()
    if (!id) throw new Error('[useKitchenCreate] placeId (id) is required')

    const name = String(input?.name ?? '').trim()
    if (!name) throw new Error('[useKitchenCreate] name is required')

    await setDocument<Kitchen>(
      COLLECTION_PATH,
      id,
      {
        id,
        name,
        formatted_address: String(input.formatted_address ?? '').trim(),
        lat: Number(input.lat ?? 0),
        lng: Number(input.lng ?? 0),
        avatar: String(input.avatar ?? '').trim(),
        website: String(input.website ?? '').trim(),
      },
      { raw: false }
    )

    return id
  }

  return { createKitchen }
}
