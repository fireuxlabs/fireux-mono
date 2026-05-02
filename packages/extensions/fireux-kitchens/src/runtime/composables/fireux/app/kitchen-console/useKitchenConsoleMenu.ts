import { useRoute } from '#imports'
import { computed } from 'vue'
import type { Menu, MenuSection } from '../../../../models/menu.model'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'

const normalizeString = (value: unknown) => String(value ?? '').trim()

const menuItemsCount = (sections?: MenuSection[]) =>
  Array.isArray(sections)
    ? sections.reduce(
        (count, section) =>
          count + (Array.isArray(section?.items) ? section.items.length : 0),
        0
      )
    : 0

export function useKitchenConsoleMenu() {
  const route = useRoute()
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    menus,
    dishes,
    pending,
  } = useKitchenConsoleMenus()

  const menuId = computed(() => {
    const raw = route.params.menuId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const menu = computed<Menu | null>(
    () =>
      menus.value.find((item) => normalizeString(item?.id) === menuId.value) ??
      null
  )

  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    menuId: menuId.value,
    hasMenu: Boolean(menu.value),
    sectionsCount: Array.isArray(menu.value?.sections)
      ? menu.value.sections.length
      : 0,
    itemsCount: menuItemsCount(menu.value?.sections),
    dishesCount: dishes.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    menus,
    dishes,
    pending,
    menuId,
    menu,
    debug,
  }
}
