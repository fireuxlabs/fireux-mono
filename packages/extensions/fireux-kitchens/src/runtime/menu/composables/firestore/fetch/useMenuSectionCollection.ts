import { computed, type Ref } from 'vue'
import type { MenuSection } from '../../../models/menu-section.model.ts'
import { useKitchenChildCollection } from '../../../../kitchen/composables/firestore/utils/paths/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const sortSections = (sections: MenuSection[]) =>
  [...sections].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.label).localeCompare(String(b.label))
  )

export function useMenuSectionCollection(
  kitchenId: Ref<string> | string,
  menuId: Ref<string> | string,
  options: Options = {}
) {
  const collectionName = computed(() => {
    const id = String(typeof menuId === 'string' ? menuId : menuId.value).trim()
    return id ? `menus/${id}/sections` : ''
  })
  const state = useKitchenChildCollection<MenuSection>(
    collectionName,
    kitchenId,
    options
  )
  const sections = computed(() =>
    sortSections(state.items.value).filter((section) => section.status !== 'archived')
  )

  return {
    ...state,
    sections,
    activeSections: sections,
  }
}
