import { computed, type Ref } from 'vue'
import type { MenuItem } from '../../../../../models/menu.model'
import { useKitchenChildCollection } from '../../kitchen/utils/paths/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const sortItems = (items: MenuItem[]) =>
  [...items].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.dish_id).localeCompare(String(b.dish_id))
  )

export function useMenuItemCollection(
  kitchenId: Ref<string> | string,
  menuId: Ref<string> | string,
  sectionId: Ref<string> | string,
  options: Options = {}
) {
  const collectionName = computed(() => {
    const mid = String(typeof menuId === 'string' ? menuId : menuId.value).trim()
    const sid = String(typeof sectionId === 'string' ? sectionId : sectionId.value).trim()
    return mid && sid ? `menus/${mid}/sections/${sid}/items` : ''
  })
  const state = useKitchenChildCollection<MenuItem>(
    collectionName,
    kitchenId,
    options
  )
  const items = computed(() =>
    sortItems(state.items.value).filter((item) => item.status !== 'archived')
  )

  return {
    ...state,
    items,
    activeItems: items,
  }
}
