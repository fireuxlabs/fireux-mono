import { useRoute } from '#imports'
import { computed } from 'vue'
import type { Menu } from '../../../../../models/menu.model'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'
import { useKitchenMenuSectionCollection } from './menu/fetch/useKitchenMenuSectionCollection'
import { useKitchenMenuSectionMutations } from './menu/mutations/useKitchenMenuSectionMutations'

const clean = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMenu() {
  const route = useRoute()
  const state = useKitchenConsoleMenus()
  const menuId = computed(() => {
    const raw = route.params.menuId
    return clean(Array.isArray(raw) ? raw[0] : raw)
  })
  const menu = computed<Menu | null>(
    () => state.menus.value.find((item) => clean(item.id) === menuId.value) ?? null
  )
  const sectionState = useKitchenMenuSectionCollection(
    state.kitchenId,
    menuId,
    {
      kitchenCollectionPath: state.rootCollection,
      databaseId: state.databaseId,
    }
  )
  const sectionMutations = useKitchenMenuSectionMutations({
    kitchenCollectionPath: state.rootCollection,
    databaseId: state.databaseId,
  })

  return {
    ...state,
    ...sectionMutations,
    menuId,
    menu,
    sections: sectionState.sections,
    sectionsPending: sectionState.pending,
    sectionsCollectionPath: sectionState.collectionPath,
    debug: computed(() => ({
      ...state.debug.value,
      menuId: menuId.value,
      hasMenu: Boolean(menu.value),
      sectionsCount: sectionState.sections.value.length,
    })),
  }
}
