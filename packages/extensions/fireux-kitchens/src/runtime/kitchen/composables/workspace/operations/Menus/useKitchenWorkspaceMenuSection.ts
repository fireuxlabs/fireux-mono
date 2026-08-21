// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: resolve Demo MenuItems locally and preserve Dish joins on section detail.
// Concurrent edit — 2026-07-22 14:08 CEST — Demo route integrity: do not project items for unresolved Menu or MenuSection detail routes.
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model.ts'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
  type MenuItem,
  type MenuItemAddOnOption,
  type MenuItemPriceOption,
} from '../../../../../menu/models/menu-item.model.ts'
import type { MenuSection } from '../../../../../menu/models/menu-section.model.ts'
import { useKitchenWorkspaceDishes } from '../Dishes/useKitchenWorkspaceDishes'
import { useKitchenWorkspaceMenu } from './useKitchenWorkspaceMenu'
import { useDishUpdate } from '../../../firestore/dish/mutations/useDishUpdate'
import { useMenuItemCollection } from '../../../../../menu/composables/firestore/fetch/useMenuItemCollection'
import { useMenuItemMutations } from '../../../../../menu/composables/firestore/mutations/useMenuItemMutations'
import {
  findKitchenWorkspaceDemoMenu,
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../core/useKitchenWorkspaceDemoData'

const clean = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export type MenuSectionItemRow = {
  id: string
  item: MenuItem
  dish: Dish | null
  dishId: string
  label: string
  price: number
  addOns: MenuItemAddOnOption[]
  priceOptions: MenuItemPriceOption[]
}

export function useKitchenWorkspaceMenuSection() {
  const menuState = useKitchenWorkspaceMenu()
  const dishState = useKitchenWorkspaceDishes()
  const sectionId = useRouteParam('sectionId')
  const section = computed<MenuSection | null>(
    () =>
      menuState.sections.value.find(
        (item) => clean(item.id) === sectionId.value
      ) ?? null
  )
  const demoData = useKitchenWorkspaceDemoData(menuState.isDemo)
  const demoScenario = computed(() =>
    findKitchenWorkspaceDemoScenario(
      demoData.data.value,
      menuState.kitchenId.value
    )
  )
  const demoMenu = computed(() =>
    findKitchenWorkspaceDemoMenu(demoScenario.value, menuState.menuId.value)
  )
  const itemState = useMenuItemCollection(
    menuState.storageKitchenId,
    computed(() => (menuState.menu.value ? menuState.menuId.value : '')),
    computed(() => (section.value ? sectionId.value : '')),
    {
      kitchenCollectionPath: menuState.rootCollection,
      databaseId: menuState.databaseId,
    }
  )
  const itemMutations = useMenuItemMutations({
    kitchenCollectionPath: menuState.rootCollection,
    databaseId: menuState.databaseId,
  })
  const dishMutations = useDishUpdate({
    kitchenCollectionPath: menuState.rootCollection,
    databaseId: menuState.databaseId,
  })
  const items = computed(() =>
    menuState.isDemo.value
      ? menuState.menu.value && section.value
        ? (demoMenu.value?.menuSections.find(
            (entry) => clean(entry.section.id) === sectionId.value
          )?.items ?? [])
        : []
      : itemState.items.value
  )
  const itemsPending = computed(() =>
    menuState.isDemo.value ? demoData.pending.value : itemState.pending.value
  )
  const itemsCollectionPath = computed(() =>
    menuState.isDemo.value
      ? `demo/kitchens/${menuState.kitchenId.value}/menus/${menuState.menuId.value}/sections/${sectionId.value}/items`
      : itemState.collectionPath.value
  )
  const dishesById = computed(() => {
    const map = new Map<string, Dish>()
    dishState.dishes.value.forEach((dish) => {
      const id = clean(dish.id)
      if (id) map.set(id, dish)
    })
    return map
  })
  const itemRows = computed<MenuSectionItemRow[]>(() =>
    items.value.map((item) => {
      const dish = dishesById.value.get(clean(item.dish_id)) ?? null
      return {
        id: clean(item.id),
        item,
        dish,
        dishId: clean(item.dish_id),
        label: clean(dish?.name) || clean(item.dish_id),
        price: Number(item.price || 0),
        addOns: normalizeMenuItemAddOns(record(item).add_ons),
        priceOptions: normalizeMenuItemPriceOptions(record(item).price_options),
      }
    })
  )

  function assertCanWrite() {
    if (!menuState.canWrite.value) throw new Error('This menu is read-only.')
  }

  async function createItem(
    ...args: Parameters<typeof itemMutations.createItem>
  ) {
    assertCanWrite()
    return itemMutations.createItem(...args)
  }

  async function updateItem(
    ...args: Parameters<typeof itemMutations.updateItem>
  ) {
    assertCanWrite()
    return itemMutations.updateItem(...args)
  }

  async function archiveItem(
    ...args: Parameters<typeof itemMutations.archiveItem>
  ) {
    assertCanWrite()
    return itemMutations.archiveItem(...args)
  }

  async function reorderItems(
    ...args: Parameters<typeof itemMutations.reorderItems>
  ) {
    assertCanWrite()
    return itemMutations.reorderItems(...args)
  }

  async function updateDish(
    ...args: Parameters<typeof dishMutations.updateDish>
  ) {
    assertCanWrite()
    return dishMutations.updateDish(...args)
  }

  return {
    ...menuState,
    createItem,
    updateItem,
    archiveItem,
    reorderItems,
    updateDish,
    sectionId,
    section,
    items,
    itemRows,
    itemsPending,
    itemsCollectionPath,
    dishes: dishState.dishes,
    dishesById,
    debug: computed(() => ({
      ...menuState.debug.value,
      sectionId: sectionId.value,
      hasSection: Boolean(section.value),
      itemsCount: items.value.length,
    })),
  }
}
