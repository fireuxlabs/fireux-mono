import type { Ref } from 'vue'
import type { Dish } from '../../../../../../models/dish.model'
import { useKitchenConsoleCollection } from '../../fetch/useKitchenConsoleCollection'

type UseKitchenDishCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenDishCollection(
  kitchenId: Ref<string> | string,
  options: UseKitchenDishCollectionOptions = {}
) {
  const state = useKitchenConsoleCollection<Dish>('dishes', kitchenId, options)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    dishes: state.items,
  }
}
