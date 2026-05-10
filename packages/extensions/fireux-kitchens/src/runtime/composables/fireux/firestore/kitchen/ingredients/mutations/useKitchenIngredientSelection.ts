import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  KitchenIngredientModel,
  type KitchenIngredient as KitchenIngredientDoc,
} from '../../../../../../models/ingredient.model'

const resolveKitchenIngredientsPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/ingredients`

const buildKitchenIngredientPayload = (
  ingredientId: string
): KitchenIngredientDoc => ({
  ...KitchenIngredientModel,
  id: ingredientId,
  ingredient_id: ingredientId,
})

export function useKitchenIngredientSelection() {
  const { setDocument } = useFirestoreCreate()
  const { deleteDocument } = useFirestoreDelete()

  const resolveKitchenIngredientsCollectionPath = (
    kitchenId: string,
    options: { kitchenCollectionPath: string }
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const kitchenCollectionPath = String(options.kitchenCollectionPath || '').trim()
    if (!kitchenCollectionPath) throw new Error('Kitchen collection path is required')

    return resolveKitchenIngredientsPath(kitchenCollectionPath, resolvedKitchenId)
  }

  const selectIngredient = async (
    kitchenId: string,
    ingredientId: string,
    options: { kitchenCollectionPath: string }
  ) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const kitchenIngredientsPath = resolveKitchenIngredientsCollectionPath(kitchenId, options)
    await setDocument<KitchenIngredientDoc>(
      kitchenIngredientsPath,
      resolvedIngredientId,
      buildKitchenIngredientPayload(resolvedIngredientId),
      {
        app: true,
        creator: true,
      }
    )

    return resolvedIngredientId
  }

  const unselectIngredient = async (
    kitchenId: string,
    ingredientId: string,
    options: { kitchenCollectionPath: string }
  ) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const kitchenIngredientsPath = resolveKitchenIngredientsCollectionPath(kitchenId, options)
    await deleteDocument(kitchenIngredientsPath, resolvedIngredientId)
  }

  return { selectIngredient, unselectIngredient }
}
