import { computed } from 'vue'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { IngredientStorage } from '../../../../ingredient/utils/ingredient.ts'
import type { IngredientInterfaceItem } from '../../../../ingredient/composables/useIngredientInterface'
import { useKitchenIngredients } from './useKitchenIngredients'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'

export function useKitchenWorkspaceIngredients() {
  const workspace = useKitchenWorkspace()
  const access = useKitchenAccess()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
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

  const canWrite = computed(
    () =>
      workspace.accountReady.value &&
      workspace.hasAccount.value &&
      Boolean(selectedKitchen.value) &&
      access.ids.value.includes(kitchenId.value)
  )

  return {
    ...page,
    canWrite,
    readOnly: computed(() => !canWrite.value),
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
