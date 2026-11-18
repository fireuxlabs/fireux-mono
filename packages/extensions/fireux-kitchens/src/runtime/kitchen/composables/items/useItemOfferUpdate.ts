import type { WatchSource } from 'vue'
import type { ItemOffer } from '../../records/menus/items/item-offer'
import { normalizeItemPricingPatch } from '../../utils/item-pricing'
import { useItemMutation } from './useItemMutation'

/** Validate and detach selling defaults before credentials; reuse Item authority. */
export function useItemOfferUpdate(ownerSources: WatchSource[] = []) {
  const { mutate } = useItemMutation(ownerSources)
  async function updateOffer(
    itemId: string,
    changes: Partial<ItemOffer>,
    target: { kitchenId: string; isCurrent?: () => boolean }
  ) {
    if (
      !changes ||
      typeof changes !== 'object' ||
      Array.isArray(changes) ||
      Object.keys(changes).some(
        (key) => !['price', 'choice_groups', 'bottle_deposit'].includes(key)
      )
    )
      throw new Error('Unsupported Item selling change.')
    const patch = normalizeItemPricingPatch(changes)
    return mutate(
      'PATCH',
      { dishId: itemId, changes: patch },
      target.kitchenId,
      target.isCurrent
    )
  }
  return { updateOffer }
}
