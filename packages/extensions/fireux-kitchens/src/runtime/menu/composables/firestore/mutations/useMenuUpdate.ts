import type { WatchSource } from 'vue'
import type { MenuUpdateInput } from '../../../models/menu-storage.model'
import { useMenuMutation } from './useMenuMutation'
export function useMenuUpdate(sources: WatchSource[] = []) {
  const { mutate } = useMenuMutation(sources)
  const updateMenu = (
    kitchenId: string,
    menuId: string,
    changes: MenuUpdateInput,
    isCurrent?: () => boolean
  ) =>
    mutate<{ id: string; slug: string }>(
      '',
      'PATCH',
      { kitchenId, menuId, changes },
      isCurrent
    )
  const renameMenu = (
    kitchenId: string,
    menuId: string,
    name: string,
    isCurrent?: () => boolean
  ) =>
    mutate<{ id: string; slug: string }>(
      'rename',
      'POST',
      { kitchenId, menuId, name },
      isCurrent
    )
  return { updateMenu, renameMenu }
}
