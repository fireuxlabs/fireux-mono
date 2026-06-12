import { computed } from 'vue'
import { IngredientStorage } from '../../../../../../models/ingredient.model'
import type { IngredientInterfaceItem } from '../../../../firestore/ingredient/utils/view/useIngredientInterface'
import { useKitchenIngredients } from './fetch/useKitchenIngredients'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleIngredients() {
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
  const { ingredients, pending: ingredientsPending, collectionPath } =
    useKitchenIngredients(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<IngredientInterfaceItem>({
    collectionName: IngredientStorage.collection,
    selectedKitchen,
    kitchenId,
    items: ingredients,
    pending: ingredientsPending,
    collectionPath,
  })
  const consoleIngredients = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: count.value,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    ingredients: consoleIngredients,
    count,
    pending,
    debug,
  }
}
