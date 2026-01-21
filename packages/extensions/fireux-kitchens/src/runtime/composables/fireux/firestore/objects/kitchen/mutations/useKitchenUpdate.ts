import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { Kitchen, KitchenUpdateInput } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenUpdate() {
  const { updateDocument } = useFirestoreManager()

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    const id = String(kitchenId ?? '').trim()
    if (!id) throw new Error('[useKitchenUpdate] kitchenId is required')

    const next: KitchenUpdateInput = { ...patch }
    if (typeof next.name === 'string') next.name = next.name.trim()
    if (typeof next.website === 'string') next.website = next.website.trim()
    if (typeof (next as any).place_image === 'string') (next as any).place_image = (next as any).place_image.trim()
    if (typeof (next as any).formatted_address === 'string') (next as any).formatted_address = (next as any).formatted_address.trim()

    await updateDocument<Kitchen>(COLLECTION_PATH, id, next)
  }

  return { updateKitchen }
}