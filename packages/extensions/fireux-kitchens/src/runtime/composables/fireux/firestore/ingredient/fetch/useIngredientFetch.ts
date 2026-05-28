import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { IngredientStorage, type Ingredient } from '../../../../../models/ingredient.model'

export function useIngredientFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()

  const fetchIngredient = (ingredientId: string) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    return firestoreFetchDoc<Ingredient>(
      IngredientStorage.collection,
      resolvedIngredientId
    )
  }

  return {
    fetchIngredient,
  }
}
