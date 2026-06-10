import { computed } from 'vue'
import { useDishCollection } from '../../../../firestore/dish/useDish'
import { DishStorage, type Dish } from '../../../../../models/dish.model'
import { useKitchenConsole } from '../../useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
}

export type KitchenDishMenuUsage = {
  dishId: string
  menuId: string
  sectionId: string
  itemId: string
}

export function useKitchenConsoleDishes(_options: { resolveMenuSections?: boolean } = {}) {
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
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: DishStorage.collection,
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveDishes,
    livePending,
    collectionPath,
  })
  const dishes = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const sections = computed<KitchenDishSection[]>(() => [])
  const menuUsageByDishId = computed<Record<string, KitchenDishMenuUsage[]>>(
    () => ({})
  )

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
    menuFilters: sections,
    sectionFilters: sections,
    menuUsageByDishId,
    getMenuUsageForDish: (dishId: string) =>
      menuUsageByDishId.value[clean(dishId)] || [],
    debug: computed(() => ({
      mode: selectedMode.value,
      kitchenId: kitchenId.value,
      collectionPath: collectionPath.value,
      count: dishes.value.length,
      pending: pending.value,
      canWrite: canWrite.value,
    })),
  }
}
