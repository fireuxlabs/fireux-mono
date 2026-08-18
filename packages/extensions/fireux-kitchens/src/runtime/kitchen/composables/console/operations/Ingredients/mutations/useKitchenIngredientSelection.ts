import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  KitchenIngredientStorage,
  KitchenIngredientModel,
  type KitchenIngredient as KitchenIngredientDoc,
} from '../../../../../models/ingredient.model.ts'

const resolveKitchenIngredientsPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${KitchenIngredientStorage.collection}`

const buildKitchenIngredientPayload = (
  ingredientId: string
): KitchenIngredientDoc => ({
  ...KitchenIngredientModel,
  id: ingredientId,
  ingredient_id: ingredientId,
})

export function useKitchenIngredientSelection() {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const create = useFirestoreClientCreate()
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
    requireWritableData()
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const kitchenIngredientsPath = resolveKitchenIngredientsCollectionPath(kitchenId, options)
    await create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-ingredients',
        kitchenIngredientsPath
      ),
      buildKitchenIngredientPayload(resolvedIngredientId),
      {
        id: resolvedIngredientId,
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
    requireWritableData()
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const kitchenIngredientsPath = resolveKitchenIngredientsCollectionPath(kitchenId, options)
    await deleteDocument(kitchenIngredientsPath, resolvedIngredientId)
  }

  return { selectIngredient, unselectIngredient }
}
