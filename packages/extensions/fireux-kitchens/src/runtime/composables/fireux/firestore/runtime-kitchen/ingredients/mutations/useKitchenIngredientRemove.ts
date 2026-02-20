import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'

const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const resolveKitchenIngredientsPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/ingredients`

export function useKitchenIngredientRemove() {
  const { deleteDocument } = useFirestoreDelete()

  const removeIngredientFromKitchen = async (
    kitchenId: string,
    ingredientId: string,
    options: { kitchenCollectionPath?: string } = {}
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const kitchenCollectionPath = String(
      options.kitchenCollectionPath || DEFAULT_KITCHEN_COLLECTION_PATH
    ).trim()
    const kitchenIngredientsPath = resolveKitchenIngredientsPath(
      kitchenCollectionPath,
      resolvedKitchenId
    )

    await deleteDocument(kitchenIngredientsPath, resolvedIngredientId)
  }

  return { removeIngredientFromKitchen }
}
