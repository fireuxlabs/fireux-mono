import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { resolveKitchenConsoleCollectionPath } from '../../../../app/kitchen-console/shared'

const resolveKitchenIngredientsPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/ingredients`

export function useKitchenIngredientRemove() {
  const { deleteDocument } = useFirestoreDelete()
  const { appId } = useFireUXConfig()

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
      options.kitchenCollectionPath || ''
    ).trim() || resolveKitchenConsoleCollectionPath(appId)
    const kitchenIngredientsPath = resolveKitchenIngredientsPath(
      kitchenCollectionPath,
      resolvedKitchenId
    )

    await deleteDocument(kitchenIngredientsPath, resolvedIngredientId)
  }

  return { removeIngredientFromKitchen }
}
