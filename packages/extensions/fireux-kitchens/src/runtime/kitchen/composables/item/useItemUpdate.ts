import type { WatchSource } from 'vue'
import type { ItemUpdateInput } from '../../utils/item'
import { useItemMutation } from './useItemMutation'

export function useItemUpdate(ownerSources: WatchSource[] = []) {
  const { mutate } = useItemMutation(ownerSources)
  const updateItem = (
    dishId: string,
    changes: Partial<ItemUpdateInput> & Record<string, unknown>,
    target: { kitchenId: string; isCurrent?: () => boolean }
  ) =>
    target.isCurrent
      ? mutate('PATCH', { dishId, changes }, target.kitchenId, target.isCurrent)
      : mutate('PATCH', { dishId, changes }, target.kitchenId)
  return { updateItem }
}
