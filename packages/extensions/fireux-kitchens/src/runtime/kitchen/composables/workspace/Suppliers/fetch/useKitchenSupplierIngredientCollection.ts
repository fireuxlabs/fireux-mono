import { computed, type Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenSupplierIngredientStorage,
  type KitchenSupplierIngredient,
} from '../../../../utils/kitchen-supplier-ingredient.ts'
import { useKitchenChildCollection } from '../../../firestore/utils/paths/useKitchenChildCollection'

export function useKitchenSupplierIngredientCollection(
  kitchenId: Ref<string> | string,
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { items, pending, collectionPath } =
    useKitchenChildCollection<KitchenSupplierIngredient>(
      KitchenSupplierIngredientStorage.collection,
      kitchenId,
      options
    )
  const { byId: kitchenSupplierIngredient } = useCollectionById(items)

  return {
    kitchenSupplierIngredients: computed(() => items.value),
    kitchenSupplierIngredient,
    pending,
    collectionPath,
  }
}
