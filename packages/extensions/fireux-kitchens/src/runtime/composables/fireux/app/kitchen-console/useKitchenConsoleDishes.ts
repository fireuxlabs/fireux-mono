import { computed } from 'vue'
import { useDishCollection } from '../../firestore/dish/fetch/useDishCollection'
import type { Dish } from '../../../../models/dish.model'
import type { Menu } from '../../../../models/menu.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'
import { useKitchenMenuCollection } from '../../firestore/runtime-kitchen/menu/fetch/useKitchenMenuCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
}

export type KitchenDishMenuUsage = {
  dishId: string
  menuId: string
  menuName: string
  sectionId: string
  sectionLabel: string
  itemId: string
  itemLabel: string
  price: number
  currencyCode: string
  active: boolean
}

type UseKitchenConsoleDishesOptions = {
  resolveMenuSections?: boolean
}

export function useKitchenConsoleDishes(
  options: UseKitchenConsoleDishesOptions = {}
) {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { dishes: liveDishes, pending: livePending, collectionPath } =
    useDishCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
    })
  const sectionFetchKitchenId = computed(() =>
    options.resolveMenuSections === false ? '' : fetchKitchenId.value
  )
  const {
    menus: liveSectionMenus,
    pending: liveSectionMenusPending,
    collectionPath: sectionMenusCollectionPath,
  } = useKitchenMenuCollection(sectionFetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: 'dishes',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveDishes,
    livePending,
    collectionPath,
  })
  const sectionMenusPage = useKitchenConsoleReadPage<Menu>({
    collectionName: 'menus',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveSectionMenus,
    livePending: liveSectionMenusPending,
    collectionPath: sectionMenusCollectionPath,
  })
  const dishes = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const sectionMenus = computed(() =>
    options.resolveMenuSections === false
      ? []
      : sectionMenusPage.collection.value.items
  )
  const kitchenCurrencyCode = computed(
    () =>
      normalizeString(
        (selectedKitchen.value as Record<string, unknown> | null)?.currency_code
      ) || 'CHF'
  )

  const sections = computed<KitchenDishSection[]>(() => {
    const dishIdsInScope = new Set(
      dishes.value
        .map((dish) => normalizeString(dish?.id))
        .filter(Boolean)
    )

    return sectionMenus.value
      .map((menu) => {
        const menuId = normalizeString(menu?.id)
        const menuName = normalizeString(menu?.name)
        const menuSort = Number(menu?.sort_order ?? 0)
        const sections = Array.isArray(menu?.sections) ? menu.sections : []
        const dishIds = Array.from(
          new Set(
            sections.flatMap((section) => {
              const items = Array.isArray(section?.items) ? section.items : []

              return items
                .map((item) => normalizeString(item?.dish_id))
                .filter((dishId) => dishIdsInScope.has(dishId))
            })
          )
        )

        return {
          id: menuId,
          label: menuName,
          menuId,
          menuName,
          menuSort,
          dishIds,
          count: dishIds.length,
        }
      })
      .filter((menu) => menu.id && menu.dishIds.length > 0)
      .sort((a, b) => {
        if (a.menuSort !== b.menuSort) return a.menuSort - b.menuSort
        return a.menuName.localeCompare(b.menuName)
      })
      .map(({ id, label, dishIds, count }) => ({
        id,
        label,
        dishIds,
        count,
      }))
  })
  const menuUsageByDishId = computed<Record<string, KitchenDishMenuUsage[]>>(() => {
    const dishIdsInScope = new Set(
      dishes.value
        .map((dish) => normalizeString(dish?.id))
        .filter(Boolean)
    )

    const usage = sectionMenus.value.reduce<Record<string, KitchenDishMenuUsage[]>>(
      (acc, menu) => {
        const menuId = normalizeString(menu?.id)
        const menuName = normalizeString(menu?.name) || menuId
        const menuActive = menu?.active !== false
        const sections = Array.isArray(menu?.sections) ? menu.sections : []

        sections.forEach((section) => {
          const sectionId = normalizeString(section?.id)
          const sectionLabel = normalizeString(section?.label) || sectionId
          const items = Array.isArray(section?.items) ? section.items : []

          items.forEach((item) => {
            const dishId = normalizeString(item?.dish_id)
            if (!dishId || !dishIdsInScope.has(dishId)) return

            const entry: KitchenDishMenuUsage = {
              dishId,
              menuId,
              menuName,
              sectionId,
              sectionLabel,
              itemId: normalizeString(item?.id),
              itemLabel: normalizeString(item?.label),
              price: Number(item?.price || 0),
              currencyCode: kitchenCurrencyCode.value,
              active: menuActive && item?.active !== false,
            }

            acc[dishId] = [...(acc[dishId] || []), entry]
          })
        })

        return acc
      },
      {}
    )

    Object.values(usage).forEach((entries) => {
      entries.sort((a, b) => {
        if (a.menuName !== b.menuName) return a.menuName.localeCompare(b.menuName)
        if (a.sectionLabel !== b.sectionLabel) {
          return a.sectionLabel.localeCompare(b.sectionLabel)
        }
        return a.itemLabel.localeCompare(b.itemLabel)
      })
    })

    return usage
  })
  const getMenuUsageForDish = (dishId: string) =>
    menuUsageByDishId.value[normalizeString(dishId)] || []
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: dishes.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
    sectionsCount: sections.value.length,
    menuFilterCount: sections.value.length,
    menuUsageDishCount: Object.keys(menuUsageByDishId.value).length,
    menuUsageCount: Object.values(menuUsageByDishId.value).reduce(
      (total, entries) => total + entries.length,
      0
    ),
  }))

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    dishes,
    pending,
    sections,
    menuUsageByDishId,
    getMenuUsageForDish,
    debug,
  }
}
