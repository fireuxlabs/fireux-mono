import { computed, type Ref } from 'vue'
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
 * FireUX stack family: Menu entity.
 * Entity: Menu.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * The base Menu seam reads root Menu records. Kitchen-scoped menu operation
 * helpers should use explicit kitchen-named seams.
 */
export function useMenu(
  menuId: string,
  options: UseMenuOptions = {}
) {
  const { menu, exists } = useMenuFetch(menuId)

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
