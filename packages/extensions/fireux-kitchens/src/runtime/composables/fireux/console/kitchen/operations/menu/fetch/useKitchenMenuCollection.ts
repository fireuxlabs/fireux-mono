import { computed, type Ref } from 'vue'
import type { Menu } from '../../../../../../../models/menu.model'
import { useKitchenChildCollection } from '../../collections/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const sortMenus = (menus: Menu[]) =>
  [...menus].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.name).localeCompare(String(b.name))
  )

export function useKitchenMenuCollection(
  kitchenId: Ref<string> | string,
  options: Options = {}
) {
  const state = useKitchenChildCollection<Menu>('menus', kitchenId, options)
  const menus = computed(() =>
    sortMenus(state.items.value).filter((menu) => menu.status !== 'archived')
  )
  const publishedMenus = computed(() =>
    menus.value.filter((menu) => menu.status === 'published')
  )

  return {
    ...state,
    menus,
    publishedMenus,
    count: computed(() => menus.value.length),
  }
}
