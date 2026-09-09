import { computed, type Ref } from 'vue'
import { useMenuFetch } from './fetch/useMenuFetch'
import { useMenuComputed } from './utils/view/useMenuComputed'
import { useMenuInterface } from './utils/view/useMenuInterface'
import { useMenuCreate } from './mutations/useMenuCreate'
import { useMenuUpdate } from './mutations/useMenuUpdate'
import { useMenuDelete } from './mutations/useMenuDelete'

export type { KitchenMenu as Menu } from '../../utils/kitchen-menu.ts'
export type {
  MenuItem,
  MenuItemPriceOption,
} from '../../utils/menu-item.ts'
export type { MenuSection } from '../../utils/menu-section.ts'
export { useKitchenMenuCollection } from '../useKitchenMenuCollection'
export { useMenuFetch } from './fetch/useMenuFetch'
export { useMenuSectionCollection } from '../useMenuSectionCollection'
export { useMenuSectionItemCollection } from '../useMenuSectionItemCollection'
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
export {
  useMenuComputed,
  useMenuServiceComputed,
} from './utils/view/useMenuComputed'
export { useMenuInterface } from './utils/view/useMenuInterface'

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
 * Menu records live under app-scoped Kitchen records. Website routes render
 * eligible published menus from that same app-scoped Kitchen child stack.
 */
export function useMenu(
  menuId: string | Ref<string>,
  options: UseMenuOptions = {}
) {
  const { menu, exists } = useMenuFetch(menuId, options)

  return {
    menu,
    exists,
    ...useMenuComputed(
      menu,
      computed(() => false)
    ),
    ...useMenuInterface(),
    ...useMenuCreate(options),
    ...useMenuUpdate(options),
    ...useMenuDelete(options),
  }
}
