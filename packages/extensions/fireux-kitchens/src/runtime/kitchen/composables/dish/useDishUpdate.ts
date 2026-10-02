import type { DishUpdateInput } from '../../utils/dish'
import { useDishMutation } from './useDishMutation'

export function useDishUpdate() {
  const { mutate } = useDishMutation()
  const updateDish = (dishId: string, changes: Partial<DishUpdateInput> & Record<string, unknown>, overrides: { kitchenId?: string } = {}) =>
    mutate('PATCH', { dishId, changes }, overrides.kitchenId)
  return { updateDish }
}
