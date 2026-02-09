import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'

const resolveKitchenCollectionPath = (kitchenId: string) =>
  `kitchens/${kitchenId}/ingredients`

export function useKitchenIngredientDelete() {
  const { deleteDocument } = useFirestoreDelete()

  const removeKitchenIngredient = async (kitchenId: string, ingredientId: string) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    await deleteDocument(resolveKitchenCollectionPath(resolvedKitchenId), resolvedIngredientId)
  }

  return { removeKitchenIngredient }
}
