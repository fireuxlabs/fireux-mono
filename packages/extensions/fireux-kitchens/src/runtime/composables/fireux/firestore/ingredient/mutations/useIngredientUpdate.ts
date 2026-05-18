import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type {
  Ingredient,
  IngredientUpdateInput,
} from '../../../../../models/ingredient.model'

const GLOBAL_INGREDIENT_COLLECTION_PATH = 'ingredients'

export function useIngredientUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  const updateIngredient = async (
    ingredientId: string,
    patch: IngredientUpdateInput
  ) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    await updateDocument<Ingredient>(
      GLOBAL_INGREDIENT_COLLECTION_PATH,
      resolvedIngredientId,
      patch as Partial<Ingredient>
    )
  }

  return { updateIngredient }
}
