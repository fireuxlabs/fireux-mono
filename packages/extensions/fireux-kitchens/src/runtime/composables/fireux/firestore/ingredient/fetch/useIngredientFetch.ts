import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ingredient } from '../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'

export function useIngredientFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()

  const fetchIngredient = (ingredientId: string) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    return firestoreFetchDoc<Ingredient>(
      GLOBAL_COLLECTION_PATH,
      resolvedIngredientId
    )
  }

  return {
    fetchIngredient,
  }
}
