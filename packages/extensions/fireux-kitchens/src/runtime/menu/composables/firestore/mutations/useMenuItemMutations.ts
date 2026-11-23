import type { MenuEntry } from '../../../records/sections/entry'
import { normalizeMenuItemPatch } from '../../../utils/records/item-patch'
import { useMenuMutation } from './useMenuMutation'

export function useMenuItemMutations() {
  const { mutate } = useMenuMutation()
  const createItem = async (
    input: {
      kitchenId: string
      menuId: string
      sectionId: string
      itemId?: string
      promotionId?: string
    },
    isCurrent?: () => boolean
  ) => (await mutate<{ id: string }>('item', 'POST', input, isCurrent)).id
  const updateItem = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    entryId: string,
    patch: Partial<MenuEntry>
  ) =>
    mutate('item', 'PATCH', {
      kitchenId,
      menuId,
      sectionId,
      entryId,
      changes: normalizeMenuItemPatch(patch),
    })
  const moveItem = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    entryId: string,
    direction: 'up' | 'down',
    isCurrent: () => boolean
  ) =>
    mutate(
      'display-order',
      'PATCH',
      { kitchenId, menuId, sectionId, entryId, direction },
      isCurrent
    )
  const removeItem = (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    entryId: string,
    isCurrent: () => boolean
  ) =>
    mutate(
      'item',
      'DELETE',
      { kitchenId, menuId, sectionId, entryId },
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
      entryId: string
    ) =>
      updateItem(kitchenId, menuId, sectionId, entryId, { status: 'archived' }),
  }
}
