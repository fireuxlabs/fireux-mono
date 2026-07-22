// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: resolve Demo Menu sections from the same local scenario as the Menu list.
// Concurrent edit — 2026-07-22 14:08 CEST — Demo route integrity: do not project sections for an unresolved Menu detail route.
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { Menu } from '../../../../../../models/kitchen/menu/menu.model'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'
import { useMenuSectionCollection } from '../../../../firestore/menu/fetch/useMenuSectionCollection'
import { useMenuSectionMutations } from '../../../../firestore/menu/mutations/useMenuSectionMutations'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'

const clean = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMenu() {
  const state = useKitchenConsoleMenus()
  const menuId = useRouteParam('menuId')
  const menu = computed<Menu | null>(
    () => state.menus.value.find((item) => clean(item.id) === menuId.value) ?? null
  )
  const source = computed(
    () => state.menuSources.value.find((item) => clean(item.id) === menuId.value) ?? null
  )
  const demoData = useKitchenConsoleDemoData(
    computed(() => state.kitchenSource.value === 'demo')
  )
  const demoScenario = computed(() => findKitchenConsoleDemoScenario(
    demoData.data.value,
    state.kitchenId.value
  ))
  const sectionMenuId = computed(() => menu.value ? menuId.value : '')
  const sectionState = useMenuSectionCollection(
    state.storageKitchenId,
    sectionMenuId,
    {
      kitchenCollectionPath: state.rootCollection,
      databaseId: state.databaseId,
    }
  )
  const sectionMutations = useMenuSectionMutations({
    kitchenCollectionPath: state.rootCollection,
    databaseId: state.databaseId,
  })
  const sections = computed(() =>
    state.kitchenSource.value === 'demo'
      ? menu.value && clean(menu.value.id) === menuId.value
        ? demoScenario.value?.menuSections.map(entry => entry.section) ?? []
        : []
      : sectionState.sections.value
  )
  const sectionsPending = computed(() =>
    state.kitchenSource.value === 'demo'
      ? demoData.pending.value
      : sectionState.pending.value
  )
  const sectionsCollectionPath = computed(() =>
    state.kitchenSource.value === 'demo'
      ? `demo/kitchens/${state.kitchenId.value}/menus/${menuId.value}/sections`
      : sectionState.collectionPath.value
  )

  return {
    ...state,
    ...sectionMutations,
    menuId,
    menu,
    source,
    sections,
    sectionsPending,
    sectionsCollectionPath,
    debug: computed(() => ({
      ...state.debug.value,
      menuId: menuId.value,
      hasMenu: Boolean(menu.value),
      hasSource: Boolean(source.value),
      sectionsCount: sections.value.length,
    })),
  }
}
