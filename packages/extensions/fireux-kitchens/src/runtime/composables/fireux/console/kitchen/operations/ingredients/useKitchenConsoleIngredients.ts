import { computed } from 'vue'
import { IngredientStorage } from '../../../../../models/ingredient.model'
import type { IngredientInterfaceItem } from '../../../../firestore/ingredient/utils/view/useIngredientInterface'
import { useKitchenIngredients } from './fetch/useKitchenIngredients'
import { useKitchenConsole } from '../../useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleIngredients() {
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
  const { ingredients: liveIngredients, pending: livePending, collectionPath } =
    useKitchenIngredients(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<IngredientInterfaceItem>({
    collectionName: IngredientStorage.collection,
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveIngredients,
    livePending,
    collectionPath,
  })
  const ingredients = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    mode: selectedMode.value,
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
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    ingredients,
    count,
    pending,
    debug,
  }
}
