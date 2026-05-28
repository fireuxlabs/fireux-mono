import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { IngredientStorage } from '../../../../../models/ingredient.model'

export function useIngredientDelete() {
  const { deleteDocument } = useFirestoreDelete()

  const deleteIngredient = async (ingredientId: string) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    await deleteDocument(IngredientStorage.collection, resolvedIngredientId)
  }

  return { deleteIngredient }
}
