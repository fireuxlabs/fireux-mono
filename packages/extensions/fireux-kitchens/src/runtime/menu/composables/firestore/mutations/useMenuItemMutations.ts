import type { MenuItem } from '../../../utils/menu-item'
import { normalizeMenuItemPatch } from '../../../utils/menu-item-patch'
import { useMenuMutation } from './useMenuMutation'

export function useMenuItemMutations() {
  const { mutate } = useMenuMutation()
  const createItem = async (input: { kitchenId: string; menuId: string; sectionId: string; dishId: string; price?: number; sort_order?: number }) =>
    (await mutate<{ id: string }>('item', 'POST', input)).id
  const updateItem = (kitchenId: string, menuId: string, sectionId: string, itemId: string, patch: Partial<MenuItem>) =>
    mutate('item', 'PATCH', { kitchenId, menuId, sectionId, itemId, changes: normalizeMenuItemPatch(patch) })
  const reorderItems = async (kitchenId: string, menuId: string, sectionId: string, orderedIds: string[]) => {
    await Promise.all(orderedIds.map(id => id.trim()).filter(Boolean).map((id, index) => updateItem(kitchenId, menuId, sectionId, id, { sort_order: index })))
  }
  return { createItem, updateItem, reorderItems,
    archiveItem: (kitchenId: string, menuId: string, sectionId: string, itemId: string) => updateItem(kitchenId, menuId, sectionId, itemId, { status: 'archived' }),
  }
}
