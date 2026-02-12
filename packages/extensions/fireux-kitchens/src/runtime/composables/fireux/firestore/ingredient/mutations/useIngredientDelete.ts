import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'

const GLOBAL_INGREDIENT_COLLECTION_PATH = 'ingredients'

export function useIngredientDelete() {
  const { deleteDocument } = useFirestoreDelete()

  const deleteIngredient = async (ingredientId: string) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    await deleteDocument(GLOBAL_INGREDIENT_COLLECTION_PATH, resolvedIngredientId)
  }

  return { deleteIngredient }
}

