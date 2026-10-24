import type { WatchSource } from 'vue'
import { useDishMutation } from './useDishMutation'

export function useDishDelete(ownerSources: WatchSource[] = []) {
  const { mutate } = useDishMutation(ownerSources)
  const deleteDish = (dishId: string, target: { kitchenId: string }) =>
    mutate('DELETE', { dishId }, target.kitchenId)
  return { deleteDish }
}
