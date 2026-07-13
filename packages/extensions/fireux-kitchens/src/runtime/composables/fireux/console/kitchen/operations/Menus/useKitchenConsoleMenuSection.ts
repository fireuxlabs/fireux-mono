import { useRoute } from '#imports'
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
  const route = useRoute()
  const menuState = useKitchenConsoleMenu()
  const dishState = useKitchenConsoleDishes()
  const sectionId = computed(() => {
    const raw = route.params.sectionId
    return clean(Array.isArray(raw) ? raw[0] : raw)
  })
  const section = computed<MenuSection | null>(
    () =>
      menuState.sections.value.find((item) => clean(item.id) === sectionId.value) ??
      null
  )
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
  const dishesById = computed(() => {
    const map = new Map<string, Dish>()
    dishState.dishes.value.forEach((dish) => {
      const id = clean(dish.id)
      if (id) map.set(id, dish)
    })
    return map
  })
  const itemRows = computed<MenuSectionItemRow[]>(() =>
    itemState.items.value.map((item) => {
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
    items: itemState.items,
    itemRows,
    itemsPending: itemState.pending,
    itemsCollectionPath: itemState.collectionPath,
    dishes: dishState.dishes,
    dishesById,
    debug: computed(() => ({
      ...menuState.debug.value,
      sectionId: sectionId.value,
      hasSection: Boolean(section.value),
      itemsCount: itemState.items.value.length,
    })),
  }
}
