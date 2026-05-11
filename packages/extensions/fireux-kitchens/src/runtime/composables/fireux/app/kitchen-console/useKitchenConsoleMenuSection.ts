import { useRoute } from '#imports'
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import type { MenuSectionItem } from '../../../../models/menu.model'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'
import { useKitchenConsoleMenu } from './useKitchenConsoleMenu'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

export type KitchenMenuSectionItemRow = {
  item: MenuSectionItem
  id: string
  dishId: string
  label: string
  dish: Dish | null
  active: boolean
  sortOrder: number
}

export function useKitchenConsoleMenuSection() {
  const route = useRoute()
  const menuState = useKitchenConsoleMenu()
  const {
    dishes,
    pending: dishesPending,
    collectionPath: dishesCollectionPath,
  } = useKitchenConsoleDishes({ resolveMenuSections: false })

  const sectionId = computed(() => {
    const raw = route.params.sectionId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const section = computed(
    () =>
      menuState.menu.value?.sections?.find(
        (item) => normalizeString(item?.id) === sectionId.value
      ) ?? null
  )

  const dishesById = computed(() => {
    const map = new Map<string, Dish>()
    dishes.value.forEach((dish) => {
      const id = normalizeString(dish?.id)
      if (id) map.set(id, dish)
    })
    return map
  })

  const items = computed(() =>
    [...(section.value?.items ?? [])].sort(
      (a, b) =>
        numberValue(a?.sort_order) - numberValue(b?.sort_order) ||
        normalizeString(a?.label || a?.dish_id || a?.id).localeCompare(
          normalizeString(b?.label || b?.dish_id || b?.id)
        )
    )
  )

  const itemRows = computed<KitchenMenuSectionItemRow[]>(() =>
    items.value.map((item) => {
      const dishId = normalizeString(item?.dish_id)
      const dish = dishesById.value.get(dishId) ?? null
      const label = normalizeString(dish?.name) || normalizeString(item?.label)

      return {
        item,
        id: normalizeString(item?.id),
        dishId,
        label,
        dish,
        active: item?.active !== false,
        sortOrder: numberValue(item?.sort_order),
      }
    })
  )

  const debug = computed(() => ({
    ...menuState.debug.value,
    sectionId: sectionId.value,
    hasSection: Boolean(section.value),
    itemsCount: itemRows.value.length,
    dishesCount: dishes.value.length,
    dishesCollectionPath: dishesCollectionPath.value,
    dishesPending: dishesPending.value,
  }))

  return {
    ...menuState,
    sectionId,
    section,
    items,
    itemRows,
    dishes,
    dishesById,
    dishesPending,
    dishesCollectionPath,
    debug,
  }
}
