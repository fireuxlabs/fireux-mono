import { computed, type Ref } from 'vue'
import { useMenuFetch } from './fetch/useMenuFetch'
import { useMenuComputed } from './utils/view/useMenuComputed'
import { useMenuInterface } from './utils/view/useMenuInterface'
import { useMenuCreate } from './mutations/useMenuCreate'
import { useMenuUpdate } from './mutations/useMenuUpdate'
import { useMenuDelete } from './mutations/useMenuDelete'
import { useMenuPublicKitchen } from './utils/view/useMenuPublicKitchen'

export type { Menu } from '../../../../models/menu.model'
export { useMenuCollection } from './fetch/useMenuCollection'
export { useMenuFetch } from './fetch/useMenuFetch'
export { useMenuSectionCollection } from './fetch/useMenuSectionCollection'
export { useMenuItemCollection } from './fetch/useMenuItemCollection'
export { useMenuCreate } from './mutations/useMenuCreate'
export { useMenuUpdate } from './mutations/useMenuUpdate'
export { useMenuDelete } from './mutations/useMenuDelete'
export { useMenuSectionMutations } from './mutations/useMenuSectionMutations'
export { useMenuItemMutations } from './mutations/useMenuItemMutations'
export { useMenuComputed } from './utils/view/useMenuComputed'
export { useMenuInterface } from './utils/view/useMenuInterface'

type UseMenuOptions = {
  surface?: 'entity' | 'public-kitchen'
  scope?: 'root' | 'kitchen'
  kitchenSlug?: Ref<string>
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
 * The base Menu seam reads root Menu records by default. Kitchen-scoped menu
 * operations use explicit `scope: 'kitchen'` options on Menu-owned seams.
 */
export function useMenu(
  menuId: string | Ref<string>,
  options: UseMenuOptions = {}
) {
  if (options.surface === 'public-kitchen') {
    if (!options.kitchenSlug) {
      throw new Error('kitchenSlug is required for public kitchen menu reads')
    }

    return useMenuPublicKitchen(options.kitchenSlug, menuId as Ref<string>) as any
  }

  const { menu, exists } = useMenuFetch(
    typeof menuId === 'string' ? menuId : menuId.value
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
