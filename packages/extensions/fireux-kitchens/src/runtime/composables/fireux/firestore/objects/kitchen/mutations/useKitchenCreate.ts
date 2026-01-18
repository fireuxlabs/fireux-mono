import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { useFirestore } from 'vuefire'
import type { KitchenCreateInput } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenCreate() {
  const { setDocument } = useFirestoreManager()
  const db = useFirestore()

  const createKitchen = async (
    input: KitchenCreateInput & { place: PlaceUpsertInput }
  ): Promise<string> => {
    const id = String(input?.id ?? '').trim()
    if (!id) throw new Error('[useKitchenCreate] placeId (id) is required')

    const name = String(input?.name ?? '').trim()
    if (!name) throw new Error('[useKitchenCreate] name is required')

    const ref = doc(db, COLLECTION_PATH, id)
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) {
      throw new Error(`[useKitchenCreate] kitchen already exists: ${id}`)
    }

    await setDocument<KitchenCreateInput>(
      COLLECTION_PATH,
      id,
      {
        id,
        name,
        formatted_address: String(input.formatted_address ?? '').trim(),
        place_image: String(input.place_image ?? '').trim(),
        website: String(input.website ?? '').trim(),
      },
      { raw: false }
    )

    return id
  }

  return { createKitchen }
}
