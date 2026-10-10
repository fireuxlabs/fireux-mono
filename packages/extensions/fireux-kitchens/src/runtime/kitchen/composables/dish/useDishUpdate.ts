import type { WatchSource } from 'vue'
import type { DishUpdateInput } from '../../utils/dish'
import { useDishMutation } from './useDishMutation'

export function useDishUpdate(ownerSources: WatchSource[] = []) {
  const { mutate } = useDishMutation(ownerSources)
  const updateDish = (
    dishId: string,
    changes: Partial<DishUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string; isCurrent?: () => boolean } = {}
  ) =>
    overrides.isCurrent
      ? mutate(
          'PATCH',
          { dishId, changes },
          overrides.kitchenId,
          overrides.isCurrent
        )
      : mutate('PATCH', { dishId, changes }, overrides.kitchenId)
  return { updateDish }
}
