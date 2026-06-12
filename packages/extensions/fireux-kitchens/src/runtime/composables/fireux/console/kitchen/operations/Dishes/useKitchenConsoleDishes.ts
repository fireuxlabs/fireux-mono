import { computed } from 'vue'
import { useDishCollection } from '../../../../firestore/dish/useDish'
import { DishStorage, type Dish } from '../../../../../../models/dish.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
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
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { dishes, pending: dishesPending, collectionPath } =
    useDishCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: DishStorage.collection,
    selectedKitchen,
    kitchenId,
    items: dishes,
    pending: dishesPending,
    collectionPath,
  })
  const consoleDishes = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const sections = computed<KitchenDishSection[]>(() => [])
  const menuUsageByDishId = computed<Record<string, KitchenDishMenuUsage[]>>(
    () => ({})
  )

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    dishes: consoleDishes,
    pending,
    sections,
    menuFilters: sections,
    sectionFilters: sections,
    menuUsageByDishId,
    getMenuUsageForDish: (dishId: string) =>
      menuUsageByDishId.value[clean(dishId)] || [],
    debug: computed(() => ({
      kitchenId: kitchenId.value,
      collectionPath: collectionPath.value,
      count: consoleDishes.value.length,
      pending: pending.value,
      canWrite: canWrite.value,
    })),
  }
}
