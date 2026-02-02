import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import type { KitchenCollection, KitchenUpdateInput } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenUpdate() {
  const base = useDocumentUpdateBase<KitchenCollection>(COLLECTION_PATH, { resolvePath: false })

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    const next: KitchenUpdateInput = { ...patch }
    if (typeof next.website === 'string') next.website = base.cleanString(next.website)

    await base.updateById(kitchenId, next)
  }

  return { updateKitchen }
}