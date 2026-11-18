import type { WatchSource } from 'vue'
import type { ItemIdentityChanges } from '../../utils/item-identity'
import { useItemMutation } from './useItemMutation'

export function useItemUpdate(ownerSources: WatchSource[] = []) {
  const { mutate } = useItemMutation(ownerSources)
  const updateItem = (
    dishId: string,
    changes: ItemIdentityChanges & Record<string, unknown>,
    target: { kitchenId: string; isCurrent?: () => boolean }
  ) =>
    target.isCurrent
      ? mutate('PATCH', { dishId, changes }, target.kitchenId, target.isCurrent)
      : mutate('PATCH', { dishId, changes }, target.kitchenId)
  return { updateItem }
}
