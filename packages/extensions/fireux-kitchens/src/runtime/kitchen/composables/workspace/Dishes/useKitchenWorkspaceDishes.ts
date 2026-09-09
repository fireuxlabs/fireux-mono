import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenDishCollection } from '../../dish/useKitchenDishCollection'
import { DishStorage, type Dish } from '../../../utils/dish.ts'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
export type KitchenDishSection = {
  id: string
  label: string
}
export type KitchenDishMenuUsage = {
  dishId: string
  menuId: string
  sectionId: string
  itemId: string
  price?: number
  currencyCode: string
  menuName: string
  sectionLabel: string
  active: boolean
}

export function useKitchenWorkspaceDishes() {
  const workspace = useKitchenWorkspace()
  const { hasIdentity } = useAuth()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const fetchKitchenId = computed(() =>
    hasIdentity.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    dishes,
    pending,
    error,
    outcome,
    collectionPath,
  } = useKitchenDishCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const page = useKitchenWorkspaceReadPage<Dish>({
    collectionName: DishStorage.collection,
    selectedKitchen,
    kitchenId,
    items: dishes,
    pending,
    collectionPath,
  })
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
    dishes,
    pending,
    error,
    outcome,
    sections,
    menuFilters: sections,
    sectionFilters: sections,
    menuUsageByDishId,
    getMenuUsageForDish: (dishId: string) =>
      menuUsageByDishId.value[dishId] || [],
    isDishInService: () => true,
    getPriceLabelForDish: () => '',
  }
}
