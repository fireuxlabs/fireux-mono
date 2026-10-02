import { useMenuMutation } from './useMenuMutation'
export function useMenuDelete() {
  const { mutate } = useMenuMutation()
  return { deleteMenu: (kitchenId: string, menuId: string) => mutate('', 'DELETE', { kitchenId, menuId }) }
}
