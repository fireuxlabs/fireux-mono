// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: resolve Demo MenuItems locally and preserve Dish joins on section detail.
// Concurrent edit — 2026-07-22 14:08 CEST — Demo route integrity: do not project items for unresolved Menu or MenuSection detail routes.
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { Dish } from '../../../../../../models/kitchen/dish.model'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
  type MenuItem,
  type MenuItemAddOnOption,
  type MenuItemPriceOption,
} from '../../../../../../models/kitchen/menu/menu-item.model'
import type { MenuSection } from '../../../../../../models/kitchen/menu/menu-section.model'
import { useKitchenConsoleDishes } from '../Dishes/useKitchenConsoleDishes'
import { useKitchenConsoleMenu } from './useKitchenConsoleMenu'
import { useDish } from '../../../../firestore/dish/useDish'
import { useMenuItemCollection } from '../../../../firestore/menu/fetch/useMenuItemCollection'
import { useMenuItemMutations } from '../../../../firestore/menu/mutations/useMenuItemMutations'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'

const clean = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
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

export function useKitchenConsoleMenuSection() {
  const menuState = useKitchenConsoleMenu()
  const dishState = useKitchenConsoleDishes()
  const sectionId = useRouteParam('sectionId')
  const section = computed<MenuSection | null>(
    () =>
      menuState.sections.value.find((item) => clean(item.id) === sectionId.value) ??
      null
  )
  const demoData = useKitchenConsoleDemoData(
    computed(() => menuState.kitchenSource.value === 'demo')
  )
  const demoScenario = computed(() => findKitchenConsoleDemoScenario(
    demoData.data.value,
    menuState.kitchenId.value
  ))
  const itemState = useMenuItemCollection(
    menuState.storageKitchenId,
    computed(() => menuState.menu.value ? menuState.menuId.value : ''),
    computed(() => section.value ? sectionId.value : ''),
    {
      kitchenCollectionPath: menuState.rootCollection,
      databaseId: menuState.databaseId,
    }
  )
  const itemMutations = useMenuItemMutations({
    kitchenCollectionPath: menuState.rootCollection,
    databaseId: menuState.databaseId,
  })
  const dishMutations = useDish({
    kitchenCollectionPath: menuState.rootCollection,
    databaseId: menuState.databaseId,
  })
  const items = computed(() =>
    menuState.kitchenSource.value === 'demo'
      ? menuState.menu.value && section.value
        ? demoScenario.value?.menuSections.find(
            entry => clean(entry.section.id) === sectionId.value
          )?.items ?? []
        : []
      : itemState.items.value
  )
  const itemsPending = computed(() =>
    menuState.kitchenSource.value === 'demo'
      ? demoData.pending.value
      : itemState.pending.value
  )
  const itemsCollectionPath = computed(() =>
    menuState.kitchenSource.value === 'demo'
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

  return {
    ...menuState,
    ...itemMutations,
    updateDish: dishMutations.updateDish,
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
