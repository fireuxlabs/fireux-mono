import type { Ref } from 'vue'
import { useKitchenIngredientFetch } from './fetch/useKitchenIngredientFetch'
import { useKitchenIngredientAdd } from './mutations/useKitchenIngredientAdd'
import { useKitchenIngredientRemove } from './mutations/useKitchenIngredientRemove'

type UseKitchenIngredientOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenIngredient(
  kitchenId: Ref<string> | string,
  options: UseKitchenIngredientOptions = {}
) {
  const fetch = useKitchenIngredientFetch(kitchenId, {
    kitchenCollectionPath: options.kitchenCollectionPath,
  })
  const add = useKitchenIngredientAdd()
  const remove = useKitchenIngredientRemove()

  return {
    ...fetch,
    ...add,
    ...remove,
  }
}
