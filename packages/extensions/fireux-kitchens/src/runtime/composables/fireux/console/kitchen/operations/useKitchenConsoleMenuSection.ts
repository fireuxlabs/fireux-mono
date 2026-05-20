import { useRoute } from '#imports'
import { computed } from 'vue'
import type { Dish } from '../../../../../models/dish.model'
import type { MenuItem, MenuSection } from '../../../../../models/menu.model'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'
import { useKitchenConsoleMenu } from './useKitchenConsoleMenu'
import { useKitchenMenuItemCollection } from './menu/fetch/useKitchenMenuItemCollection'
import { useKitchenMenuItemMutations } from './menu/mutations/useKitchenMenuItemMutations'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenMenuSectionItemRow = {
  id: string
  item: MenuItem
  dish: Dish | null
  dishId: string
  label: string
  price: number
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
  const itemState = useKitchenMenuItemCollection(
    menuState.kitchenId,
    menuState.menuId,
    sectionId,
    {
      kitchenCollectionPath: menuState.rootCollection,
      databaseId: menuState.databaseId,
    }
  )
  const itemMutations = useKitchenMenuItemMutations({
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
  const itemRows = computed<KitchenMenuSectionItemRow[]>(() =>
    itemState.items.value.map((item) => {
      const dish = dishesById.value.get(clean(item.dish_id)) ?? null
      return {
        id: clean(item.id),
        item,
        dish,
        dishId: clean(item.dish_id),
        label: clean(dish?.name) || clean(item.dish_id),
        price: Number(item.price || 0),
      }
    })
  )

  return {
    ...menuState,
    ...itemMutations,
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
