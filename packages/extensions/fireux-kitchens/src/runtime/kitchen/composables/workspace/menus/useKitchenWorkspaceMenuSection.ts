import type { KitchenPromotion } from '../../../models/promotion.model'
import { useKitchenChildCollection } from '../../useKitchenChildCollection'
import type {
  DishPriceOption,
  DishAddOnOption,
} from '../../../models/dish.model'
import {
  normalizeDishPriceOptions,
  normalizeDishAddOns,
} from '../../../utils/dish-pricing'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed, inject, provide, type InjectionKey } from 'vue'
import type { Dish } from '../../../utils/dish.ts'
import { type MenuItem } from '../../../../menu/utils/menu-item.ts'
import type { MenuSection } from '../../../../menu/utils/menu-section.ts'
import { useKitchenWorkspaceDishes } from '../dishes/useKitchenWorkspaceDishes'
import { useKitchenMenuRecordContext } from './useKitchenMenuRecordContext'
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
  promotionId: string
  dishId: string
  label: string
  price: number
  addOns: DishAddOnOption[]
  priceOptions: DishPriceOption[]
}

const sectionContext: InjectionKey<ReturnType<typeof createMenuSectionState>> =
  Symbol('menu-section')

export function provideKitchenWorkspaceMenuSection(
  menuState: ReturnType<typeof useKitchenMenuRecordContext>
) {
  const state = createMenuSectionState(menuState)
  provide(sectionContext, state)
  return state
}

export function useKitchenWorkspaceMenuSection() {
  return inject(sectionContext) || createMenuSectionState()
}

function createMenuSectionState(menuState = useKitchenMenuRecordContext()) {
  const dishState = useKitchenWorkspaceDishes()
  const promotions = useKitchenChildCollection<KitchenPromotion>(
    'promotions',
    menuState.storageKitchenId,
    {
      kitchenCollectionPath: menuState.rootCollection,
      databaseId: menuState.databaseId,
    }
  )
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
  const itemMutations = useMenuItemMutations()
  const dishMutations = useDishUpdate()
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
      const deal = promotions.items.value.find(
        (promotion) =>
          promotion.id === item.promotion_id && 'groups' in promotion
      )
      return {
        id: clean(item.id),
        item,
        dish,
        dishId: clean(item.dish_id),
        promotionId: clean(item.promotion_id),
        label:
          clean(deal?.name) ||
          clean(dish?.name) ||
          clean(item.promotion_id) ||
          clean(item.dish_id),
        price: deal && 'price' in deal ? deal.price : Number(dish?.price || 0),
        addOns: normalizeDishAddOns(record(dish).add_ons),
        priceOptions: normalizeDishPriceOptions(record(dish).price_options),
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
    itemsError: itemState.error,
    itemsOutcome: itemState.outcome,
    itemsCollectionPath,
    promotions,
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
