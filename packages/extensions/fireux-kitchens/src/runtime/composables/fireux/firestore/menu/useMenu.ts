import { computed, type Ref } from 'vue'
import { useMenuFetch } from './fetch/useMenuFetch'
import { useMenuComputed } from './utils/view/useMenuComputed'
import { useMenuInterface } from './utils/view/useMenuInterface'
import { useMenuCreate } from './mutations/useMenuCreate'
import { useMenuUpdate } from './mutations/useMenuUpdate'
import { useMenuDelete } from './mutations/useMenuDelete'

export type { Menu } from '../../../../models/menu.model'
export type { MenuItem, MenuItemPriceOption } from '../../../../models/menu-item.model'
export type { MenuSection } from '../../../../models/menu-section.model'
export { useMenuCollection } from './fetch/useMenuCollection'
export { useMenuFetch } from './fetch/useMenuFetch'
export { useMenuSectionCollection } from './fetch/useMenuSectionCollection'
export { useMenuItemCollection } from './fetch/useMenuItemCollection'
export { useMenuCreate } from './mutations/useMenuCreate'
export { useMenuUpdate } from './mutations/useMenuUpdate'
export { useMenuDelete } from './mutations/useMenuDelete'
export { useMenuSectionMutations } from './mutations/useMenuSectionMutations'
export { useMenuItemMutations } from './mutations/useMenuItemMutations'
export {
  menuItemsPath,
  menuPath,
  menuSectionsPath,
  scopedMenuPath,
} from './utils/paths'
export { useMenuComputed } from './utils/view/useMenuComputed'
export { useMenuInterface } from './utils/view/useMenuInterface'
export {
  resolveMenuMaturity,
  useMenuMaturity,
  type MenuMaturity,
  type MenuMaturityState,
} from './utils/view/useMenuMaturity'

type UseMenuOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  kitchenId?: string | Ref<string | null | undefined>
  useSelectedKitchen?: boolean
  databaseId?: string | Ref<string | null | undefined>
}

/**
 * FireUX stack family: Menu entity.
 * Entity: Menu.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * Menu records live under app-scoped Kitchen records. Public routes render
 * eligible published menus from that same app-scoped Kitchen child stack.
 */
export function useMenu(
  menuId: string | Ref<string>,
  options: UseMenuOptions = {}
) {
  const { menu, exists } = useMenuFetch(
    menuId,
    options
  )

  return {
    menu,
    exists,
    ...useMenuComputed(menu, computed(() => false)),
    ...useMenuInterface(),
    ...useMenuCreate(options),
    ...useMenuUpdate(options),
    ...useMenuDelete(options),
  }
}
