import type { KitchenPromotion } from '../../kitchen/models/promotion.model'
import { useKitchenChildCollection } from '../../kitchen/composables/useKitchenChildCollection'
import type {
  DishPriceOption,
  DishAddOnOption,
} from '../../kitchen/models/dish.model'
import {
  normalizeDishPriceOptions,
  normalizeDishAddOns,
} from '../../kitchen/utils/dish-pricing'
import {
  computed,
  toValue,
  inject,
  provide,
  type MaybeRefOrGetter,
  type InjectionKey,
} from 'vue'
import type { Dish } from '../../kitchen/utils/dish.ts'
import { type MenuItem } from '../utils/menu-item.ts'
import type { MenuSection } from '../utils/menu-section.ts'
import { useKitchenDishCollection } from '../../kitchen/composables/useKitchenDishCollection'
import type { useKitchenMenuRecordContext } from '../../kitchen/composables/workspace/menus/useKitchenMenuRecordContext'
import { useDishUpdate } from '../../kitchen/composables/dish/useDishUpdate'
import { useMenuSectionItemCollection } from './useMenuSectionItemCollection'
import { useMenuItemMutations } from './firestore/mutations/useMenuItemMutations'

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
  price: number | undefined
  addOns: DishAddOnOption[]
  priceOptions: DishPriceOption[]
}

const sectionContext: InjectionKey<ReturnType<typeof createMenuSectionState>> =
  Symbol('menu-section')

export function provideMenuSection(
  menuState: ReturnType<typeof useKitchenMenuRecordContext>,
  sectionId: MaybeRefOrGetter<string>
) {
  const state = createMenuSectionState(menuState, sectionId)
  provide(sectionContext, state)
  return state
}

export function useMenuSection() {
  const state = inject(sectionContext)
  if (!state) throw new Error('Menu Section context is not available.')
  return state
}

function createMenuSectionState(
  menuState: ReturnType<typeof useKitchenMenuRecordContext>,
  requestedSectionId: MaybeRefOrGetter<string>
) {
  const dishState = useKitchenDishCollection(menuState.storageKitchenId, {
    kitchenCollectionPath: menuState.rootCollection,
    databaseId: menuState.databaseId,
  })
  const promotions = useKitchenChildCollection<KitchenPromotion>(
    'promotions',
    menuState.storageKitchenId,
    {
      kitchenCollectionPath: menuState.rootCollection,
      databaseId: menuState.databaseId,
    }
  )
  const sectionId = computed(() =>
    String(toValue(requestedSectionId) || '').trim()
  )
  const section = computed<MenuSection | null>(
    () =>
      menuState.allSections.value.find(
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
  const dishMutations = useDishUpdate([
    menuState.storageKitchenId,
    menuState.menuId,
    sectionId,
    menuState.canWrite,
  ])
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
        price: deal && 'price' in deal ? deal.price : dish?.price,
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

  async function moveItem(...args: Parameters<typeof itemMutations.moveItem>) {
    assertCanWrite()
    return itemMutations.moveItem(...args)
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
    removeItem: itemMutations.removeItem,
    archiveItem,
    moveItem,
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
    dishSource: dishState,
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
