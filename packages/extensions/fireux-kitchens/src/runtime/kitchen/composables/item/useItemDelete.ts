import type { WatchSource } from 'vue'
import { useItemMutation } from './useItemMutation'

export function useItemDelete(ownerSources: WatchSource[] = []) {
  const { mutate } = useItemMutation(ownerSources)
  const deleteItem = (dishId: string, target: { kitchenId: string }) =>
    mutate('DELETE', { dishId }, target.kitchenId)
  return { deleteItem }
}
