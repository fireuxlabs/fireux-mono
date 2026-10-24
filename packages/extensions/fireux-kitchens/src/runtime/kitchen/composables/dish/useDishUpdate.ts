import type { WatchSource } from 'vue'
import type { DishUpdateInput } from '../../utils/dish'
import { useDishMutation } from './useDishMutation'

export function useDishUpdate(ownerSources: WatchSource[] = []) {
  const { mutate } = useDishMutation(ownerSources)
  const updateDish = (
    dishId: string,
    changes: Partial<DishUpdateInput> & Record<string, unknown>,
    target: { kitchenId: string; isCurrent?: () => boolean }
  ) =>
    target.isCurrent
      ? mutate('PATCH', { dishId, changes }, target.kitchenId, target.isCurrent)
      : mutate('PATCH', { dishId, changes }, target.kitchenId)
  return { updateDish }
}
