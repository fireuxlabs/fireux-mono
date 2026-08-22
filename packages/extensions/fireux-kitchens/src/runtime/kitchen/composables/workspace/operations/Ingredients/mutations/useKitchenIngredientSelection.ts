import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  KitchenIngredientStorage,
  KitchenIngredientDefaults,
  type KitchenIngredient as KitchenIngredientDoc,
} from '../../../../../utils/kitchen-ingredient.ts'

const resolveKitchenIngredientsPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${KitchenIngredientStorage.collection}`

const buildKitchenIngredientPayload = (
  ingredientId: string
): KitchenIngredientDoc => ({
  ...KitchenIngredientDefaults,
  id: ingredientId,
  ingredient_id: ingredientId,
})

export function useKitchenIngredientSelection() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const create = useFirestoreClientCreate()
  const { deleteDocument } = useFirestoreDelete()

  const resolveKitchenIngredientsCollectionPath = (
    kitchenId: string,
    options: { kitchenCollectionPath: string }
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const kitchenCollectionPath = String(
      options.kitchenCollectionPath || ''
    ).trim()
    if (!kitchenCollectionPath)
      throw new Error('Kitchen collection path is required')

    return resolveKitchenIngredientsPath(
      kitchenCollectionPath,
      resolvedKitchenId
    )
  }

  const selectIngredient = async (
    kitchenId: string,
    ingredientId: string,
    options: { kitchenCollectionPath: string }
  ) => {
    requireWritableData()
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const kitchenIngredientsPath = resolveKitchenIngredientsCollectionPath(
      kitchenId,
      options
    )
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

    const kitchenIngredientsPath = resolveKitchenIngredientsCollectionPath(
      kitchenId,
      options
    )
    await deleteDocument(kitchenIngredientsPath, resolvedIngredientId)
  }

  return { selectIngredient, unselectIngredient }
}
