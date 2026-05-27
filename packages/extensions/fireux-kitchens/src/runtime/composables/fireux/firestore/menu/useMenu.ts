import type { Ref } from 'vue'
import { useMenuFetch } from './fetch/useMenuFetch'
import { useMenuComputed } from './utils/view/useMenuComputed'
import { useMenuInterface } from './utils/view/useMenuInterface'
import { useMenuCreate } from './mutations/useMenuCreate'
import { useMenuUpdate } from './mutations/useMenuUpdate'
import { useMenuDelete } from './mutations/useMenuDelete'

export type { Menu } from '../../../../models/menu.model'
export { useMenuCollection } from './fetch/useMenuCollection'
export { useMenuFetch } from './fetch/useMenuFetch'
export { useMenuCreate } from './mutations/useMenuCreate'
export { useMenuUpdate } from './mutations/useMenuUpdate'
export { useMenuDelete } from './mutations/useMenuDelete'
export { useMenuComputed } from './utils/view/useMenuComputed'
export { useMenuInterface } from './utils/view/useMenuInterface'

type UseMenuOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  kitchenId?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

/**
 * FireUX stack family: Kitchen-scoped publishable child entity.
 * Entity: Menu.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * Menu is scoped to Kitchen-owned public menu publishing. Public root routes
 * such as /menus/:slug should resolve to this family instead of becoming a
 * separate root Menu entity.
 */
export function useMenu(
  menuId: string | Ref<string | null | undefined> | null | undefined,
  options: UseMenuOptions = {}
) {
  const { menu, pending, error, kitchenId, collectionPath } = useMenuFetch(menuId, options)

  return {
    menu,
    pending,
    error,
    kitchenId,
    collectionPath,
    ...useMenuComputed(menu, pending),
    ...useMenuInterface(),
    ...useMenuCreate(options),
    ...useMenuUpdate(options),
    ...useMenuDelete(options),
  }
}
