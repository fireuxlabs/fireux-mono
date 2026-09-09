import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { Dish } from '../../../utils/dish.ts'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
  type MenuItem,
  type MenuItemAddOnOption,
  type MenuItemPriceOption,
} from '../../../../menu/utils/menu-item.ts'
import type { MenuSection } from '../../../../menu/utils/menu-section.ts'
import { useKitchenWorkspaceDishes } from '../dishes/useKitchenWorkspaceDishes'
import { useKitchenWorkspaceMenu } from './useKitchenWorkspaceMenu'
import { useDishUpdate } from '../../dish/useDishUpdate'
import { useMenuSectionItemCollection } from '../../../../menu/composables/useMenuSectionItemCollection'
import { useMenuItemMutations } from '../../../../menu/composables/firestore/mutations/useMenuItemMutations'

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
  const itemState = useMenuSectionItemCollection(
    menuState.storageKitchenId,
    computed(() => (menuState.menu.value ? menuState.menuId.value : '')),
    computed(() => (section.value ? sectionId.value : '')),
    {
      kitchenCollectionPath: menuState.rootCollection,
      databaseId: menuState.databaseId,
      includeArchived: true,
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
  const items = itemState.items
  const itemsPending = itemState.pending
  const itemsCollectionPath = itemState.collectionPath
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
