import { computed } from 'vue'
import { useDishCollection } from '../../firestore/dish/fetch/useDishCollection'
import type { Dish } from '../../../../models/dish.model'
import type { Menu } from '../../../../models/menu.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'
import { useKitchenMenuCollection } from '../../firestore/kitchen/menu/fetch/useKitchenMenuCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeNumber = (value: unknown) => Number(value ?? 0) || 0

export type KitchenDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
  menuId?: string
  menuName?: string
  menuSort?: number
  sectionId?: string
  sectionLabel?: string
  sectionSort?: number
}

export type KitchenDishMenuUsage = {
  dishId: string
  menuId: string
  menuName: string
  menuSort: number
  sectionId: string
  sectionLabel: string
  sectionSort: number
  itemId: string
  itemLabel: string
  itemSort: number
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

  const dishIdsInScope = computed(
    () =>
      new Set(
        dishes.value
          .map((dish) => normalizeString(dish?.id))
          .filter(Boolean)
      )
  )
  const sortedMenus = computed(() =>
    [...sectionMenus.value].sort((a, b) => {
      const sortDiff =
        normalizeNumber(a?.sort_order) - normalizeNumber(b?.sort_order)
      if (sortDiff) return sortDiff

      return normalizeString(a?.name).localeCompare(normalizeString(b?.name))
    })
  )
  const sortedMenuSections = (menu: Menu) =>
    [...(Array.isArray(menu?.sections) ? menu.sections : [])].sort((a, b) => {
      const sortDiff =
        normalizeNumber(a?.sort_order) - normalizeNumber(b?.sort_order)
      if (sortDiff) return sortDiff

      return normalizeString(a?.label).localeCompare(normalizeString(b?.label))
    })
  const sortedSectionItems = (
    section: Menu['sections'][number] | undefined
  ) =>
    [...(Array.isArray(section?.items) ? section.items : [])].sort((a, b) => {
      const sortDiff =
        normalizeNumber(a?.sort_order) - normalizeNumber(b?.sort_order)
      if (sortDiff) return sortDiff

      return normalizeString(a?.dish_id).localeCompare(
        normalizeString(b?.dish_id)
      )
    })
  const dishIdsForSection = (section: Menu['sections'][number]) =>
    Array.from(
      new Set(
        sortedSectionItems(section)
          .map((item) => normalizeString(item?.dish_id))
          .filter((dishId) => dishIdsInScope.value.has(dishId))
      )
    )

  const menuFilters = computed<KitchenDishSection[]>(() =>
    sortedMenus.value
      .map((menu) => {
        const menuId = normalizeString(menu?.id)
        const menuName = normalizeString(menu?.name) || menuId
        const menuSort = normalizeNumber(menu?.sort_order)
        const dishIds = Array.from(
          new Set(sortedMenuSections(menu).flatMap(dishIdsForSection))
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
  )
  const sectionFilters = computed<KitchenDishSection[]>(() =>
    sortedMenus.value
      .flatMap((menu) => {
        const menuId = normalizeString(menu?.id)
        const menuName = normalizeString(menu?.name) || menuId
        const menuSort = normalizeNumber(menu?.sort_order)

        return sortedMenuSections(menu).map((section) => {
          const sectionId = normalizeString(section?.id)
          const sectionLabel = normalizeString(section?.label) || sectionId
          const dishIds = dishIdsForSection(section)

          return {
            id: `${menuId}:${sectionId}`,
            label: `${menuName} · ${sectionLabel}`,
            dishIds,
            count: dishIds.length,
            menuId,
            menuName,
            menuSort,
            sectionId,
            sectionLabel,
            sectionSort: normalizeNumber(section?.sort_order),
          }
        })
      })
      .filter((section) => section.menuId && section.sectionId && section.dishIds.length > 0)
  )
  const sections = menuFilters
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
        const menuSort = Number(menu?.sort_order ?? 0)
        const menuActive = menu?.active !== false
        const sections = Array.isArray(menu?.sections) ? menu.sections : []

        sections.forEach((section) => {
          const sectionId = normalizeString(section?.id)
          const sectionLabel = normalizeString(section?.label) || sectionId
          const sectionSort = Number(section?.sort_order ?? 0)
          const items = Array.isArray(section?.items) ? section.items : []

          items.forEach((item) => {
            const dishId = normalizeString(item?.dish_id)
            if (!dishId || !dishIdsInScope.has(dishId)) return

            const entry: KitchenDishMenuUsage = {
              dishId,
              menuId,
              menuName,
              menuSort,
              sectionId,
              sectionLabel,
              sectionSort,
              itemId: normalizeString(item?.id),
              itemLabel: normalizeString(item?.label),
              itemSort: Number(item?.sort_order ?? 0),
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
        if (a.menuSort !== b.menuSort) return a.menuSort - b.menuSort
        if (a.menuName !== b.menuName) return a.menuName.localeCompare(b.menuName)
        if (a.sectionSort !== b.sectionSort) return a.sectionSort - b.sectionSort
        if (a.sectionLabel !== b.sectionLabel) {
          return a.sectionLabel.localeCompare(b.sectionLabel)
        }
        if (a.itemSort !== b.itemSort) return a.itemSort - b.itemSort
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
    menuFilterCount: menuFilters.value.length,
    sectionFilterCount: sectionFilters.value.length,
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
    menuFilters,
    sectionFilters,
    menuUsageByDishId,
    getMenuUsageForDish,
    debug,
  }
}
