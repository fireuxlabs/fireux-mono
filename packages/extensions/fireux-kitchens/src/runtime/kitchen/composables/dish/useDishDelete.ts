import { useDishMutation } from './useDishMutation'

export function useDishDelete() {
  const { mutate } = useDishMutation()
  const deleteDish = (dishId: string, overrides: { kitchenId?: string } = {}) =>
    mutate('DELETE', { dishId }, overrides.kitchenId)
  return { deleteDish }
}
