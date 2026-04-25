import { computed } from 'vue'
import { useKitchenDishCollection } from '../../firestore/runtime-kitchen/dish/fetch/useKitchenDishCollection'
import type { Dish } from '../../../../models/dish.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
}

export function useKitchenConsoleDishes() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() => (selectedMode.value === 'demo' ? '' : kitchenId.value))
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const { dishes: liveDishes, pending: livePending, collectionPath } =
    useKitchenDishCollection(fetchKitchenId, { kitchenCollectionPath })
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: 'dishes',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveDishes,
    livePending,
    collectionPath,
  })
  const dishes = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const { menus } = useKitchenConsoleMenus()

  const sections = computed<KitchenDishSection[]>(() => {
    const dishIdsInScope = new Set(
      dishes.value
        .map((dish) => normalizeString(dish?.id))
        .filter(Boolean)
    )

    const rawSections = menus.value.flatMap((menu) => {
      const menuId = normalizeString(menu?.id)
      const menuName = normalizeString(menu?.name)
      const menuSort = Number(menu?.sort_order ?? 0)
      const sections = Array.isArray(menu?.sections) ? menu.sections : []

      return sections.map((section, index) => {
        const sectionId = normalizeString(section?.id)
        const sectionLabel = normalizeString(section?.label)
        const items = Array.isArray(section?.items) ? section.items : []
        const dishIds = Array.from(
          new Set(
            items
              .map((item) => normalizeString(item?.dish_id))
              .filter((dishId) => dishIdsInScope.has(dishId))
          )
        )

        return {
          id: `${menuId}:${sectionId}`,
          menuId,
          menuName,
          menuSort,
          sectionId,
          sectionLabel,
          sectionSort: Number(section?.sort_order ?? index),
          dishIds,
        }
      })
    })

    const duplicateCounts = rawSections.reduce<Record<string, number>>((acc, section) => {
      const key = normalizeString(section.sectionLabel).toLowerCase()
      if (!key) return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return rawSections
      .filter((section) => section.dishIds.length > 0)
      .sort((a, b) => {
        if (a.menuSort !== b.menuSort) return a.menuSort - b.menuSort
        return a.sectionSort - b.sectionSort
      })
      .map((section) => {
        const duplicateKey = normalizeString(section.sectionLabel).toLowerCase()
        const hasDuplicateLabel = Boolean(duplicateCounts[duplicateKey] > 1)

        return {
          id: section.id,
          label:
            hasDuplicateLabel && section.menuName
              ? `${section.menuName} · ${section.sectionLabel}`
              : section.sectionLabel,
          dishIds: section.dishIds,
          count: section.dishIds.length,
        }
      })
  })

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    dishes,
    pending,
    sections,
  }
}
