import { computed } from 'vue'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { IngredientStorage } from '../../../../ingredient/utils/ingredient.ts'
import type { IngredientInterfaceItem } from '../../../../ingredient/composables/useIngredientInterface'
import { useKitchenIngredients } from './fetch/useKitchenIngredients'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'

export function useKitchenWorkspaceIngredients() {
  const workspace = useKitchenWorkspace()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.selectedId
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const {
    ingredients,
    pending,
    error: loadError,
    collectionPath,
  } = useKitchenIngredients(kitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
    enabled: computed(() => Boolean(kitchenId.value)),
  })
  const page = useKitchenWorkspaceReadPage<IngredientInterfaceItem>({
    collectionName: IngredientStorage.collection,
    selectedKitchen,
    kitchenId,
    items: ingredients,
    pending,
    collectionPath,
  })
  const workspaceIngredients = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const kitchenName = computed(() =>
    String(
      selectedKitchen.value?.display_name ||
        selectedKitchen.value?.name ||
        kitchenId.value ||
        ''
    ).trim()
  )

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    ingredients: workspaceIngredients,
    count,
    kitchenName,
    pending,
    loadError,
    isIngredientInService: () => true,
  }
}
