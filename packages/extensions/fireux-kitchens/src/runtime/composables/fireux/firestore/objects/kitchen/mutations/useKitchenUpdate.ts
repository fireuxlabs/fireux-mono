import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import type { KitchenOverlay, KitchenUpdateInput } from '../../../../../../models/objects/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenUpdate() {
  const base = useDocumentUpdateBase<KitchenOverlay>(COLLECTION_PATH, { resolvePath: false })

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    const next: KitchenUpdateInput = { ...patch }
    if (typeof next.website === 'string') next.website = base.cleanString(next.website)

    await base.updateById(kitchenId, next)
  }

  return { updateKitchen }
}