import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { KitchenOverlay, KitchenUpdateInput } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenUpdate() {
  const { updateDocument } = useFirestoreManager()

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    const id = String(kitchenId ?? '').trim()
    if (!id) throw new Error('[useKitchenUpdate] kitchenId is required')

    const next: KitchenUpdateInput = { ...patch }
    if (typeof next.website === 'string') next.website = next.website.trim()

    await updateDocument<KitchenOverlay>(COLLECTION_PATH, id, next)
  }

  return { updateKitchen }
}