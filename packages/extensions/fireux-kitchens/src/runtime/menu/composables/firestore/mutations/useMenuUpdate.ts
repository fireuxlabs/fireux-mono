import type { KitchenMenuUpdateInput } from '../../../utils/kitchen-menu'
import { useMenuMutation } from './useMenuMutation'
export function useMenuUpdate() {
  const { mutate } = useMenuMutation()
  const updateMenu = (kitchenId: string, menuId: string, changes: KitchenMenuUpdateInput) =>
    mutate<{ id: string; slug: string }>('', 'PATCH', { kitchenId, menuId, changes })
  const renameMenu = (kitchenId: string, menuId: string, name: string) =>
    mutate<{ id: string; slug: string }>('rename', 'POST', { kitchenId, menuId, name })
  return { updateMenu, renameMenu }
}
