import type { MenuItem } from '../../../utils/menu-item'
import { normalizeMenuItemPatch } from '../../../utils/menu-item-patch'
import { useMenuMutation } from './useMenuMutation'

export function useMenuItemMutations() {
  const { mutate } = useMenuMutation()
  const createItem = async (input: {
    kitchenId: string
    menuId: string
    sectionId: string
    dishId?: string
    promotionId?: string
  }) => (await mutate<{ id: string }>('item', 'POST', input)).id
  const updateItem = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    itemId: string,
    patch: Partial<MenuItem>
  ) =>
    mutate('item', 'PATCH', {
      kitchenId,
      menuId,
      sectionId,
      itemId,
      changes: normalizeMenuItemPatch(patch),
    })
  const moveItem = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    itemId: string,
    direction: 'up' | 'down',
    isCurrent: () => boolean
  ) =>
    mutate(
      'display-order',
      'PATCH',
      { kitchenId, menuId, sectionId, itemId, direction },
      isCurrent
    )
  const removeItem = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    itemId: string,
    isCurrent: () => boolean
  ) =>
    mutate(
      'item',
      'DELETE',
      { kitchenId, menuId, sectionId, itemId },
      isCurrent
    )
  return {
    createItem,
    updateItem,
    moveItem,
    removeItem,
    archiveItem: (
      kitchenId: string,
      menuId: string,
      sectionId: string,
      itemId: string
    ) =>
      updateItem(kitchenId, menuId, sectionId, itemId, { status: 'archived' }),
  }
}
