import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenDishCollection } from '../../firestore/dish/fetch/useKitchenDishCollection'
import { DishStorage, type Dish } from '../../../utils/dish.ts'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import type {
  KitchenDemoDishMenuUsage,
  KitchenDemoDishSection,
} from '../../../utils/demo-dishes'

export type KitchenDishSection = KitchenDemoDishSection
export type KitchenDishMenuUsage = KitchenDemoDishMenuUsage

export function useKitchenWorkspaceDishes() {
  const workspace = useKitchenWorkspace()
  const { hasIdentity } = useAuth()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.selectedId
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
