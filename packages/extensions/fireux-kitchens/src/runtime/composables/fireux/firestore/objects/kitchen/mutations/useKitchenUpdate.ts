import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import type { KitchenCollection, KitchenUpdateInput } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenUpdate() {
  const base = useDocumentUpdateBase<KitchenCollection>(COLLECTION_PATH, { resolvePath: false })

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    await base.updateById(kitchenId, patch)
  }

  return { updateKitchen }
}