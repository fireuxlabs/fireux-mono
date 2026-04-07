import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import type { Kitchen, KitchenUpdateInput } from '../../../../../models/kitchen.model'

const COLLECTION_PATH = 'kitchens'

export function useKitchenUpdate() {
  const base = useDocumentUpdateBase<Kitchen>(COLLECTION_PATH, { resolvePath: false })
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    await base.updateById(kitchenId, patch)
    await upsertSeoIndexDoc('seo_index_kitchens', kitchenId, {
      path: `/kitchens/${kitchenId}`,
      isPublic: true,
    })
  }

  return { updateKitchen }
}
