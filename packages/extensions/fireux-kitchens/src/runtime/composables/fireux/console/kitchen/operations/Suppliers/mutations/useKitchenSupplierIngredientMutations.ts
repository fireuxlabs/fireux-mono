import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { unref, type Ref } from 'vue'
import {
  KitchenSupplierIngredientStorage,
  type KitchenSupplierIngredient,
  type KitchenSupplierIngredientCreateInput,
  type KitchenSupplierIngredientUpdateInput,
} from '../../../../../../../models/kitchen/supplier-ingredient.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenSupplierIngredientMutations(options: Options = {}) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { appId } = useFireUXConfig()
  const create = useFirestoreClientCreate()
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })

  const path = (kitchenId: string) =>
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId,
      collectionName: KitchenSupplierIngredientStorage.collection,
      appId,
    })

  const createKitchenSupplierIngredient = async (
    input: KitchenSupplierIngredientCreateInput
  ) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchen_id)
    const supplierId = normalizeString(input.supplier_id)
    const ingredientId = normalizeString(input.ingredient_id)
    const collectionPath = path(kitchenId)

    if (!collectionPath) throw new Error('Kitchen id is required')
    if (!supplierId) throw new Error('Supplier id is required')
    if (!ingredientId) throw new Error('Ingredient id is required')

    return create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-supplier-ingredients',
        collectionPath
      ),
      {
        kitchen_id: kitchenId,
        supplier_id: supplierId,
        ingredient_id: ingredientId,
      },
      { app: true, creator: true }
    )
  }

  const updateKitchenSupplierIngredient = async (
    kitchenId: string,
    supplierIngredientId: string,
    patch: KitchenSupplierIngredientUpdateInput
  ) => {
    requireWritableData()
    const collectionPath = path(kitchenId)
    const id = normalizeString(supplierIngredientId)
    if (!collectionPath || !id) throw new Error('Missing supplier ingredient')
    await updateDocument<KitchenSupplierIngredient>(collectionPath, id, patch)
  }

  const deleteKitchenSupplierIngredient = async (
    kitchenId: string,
    supplierIngredientId: string
  ) => {
    requireWritableData()
    const collectionPath = path(kitchenId)
    const id = normalizeString(supplierIngredientId)
    if (!collectionPath || !id) throw new Error('Missing supplier ingredient')
    await deleteDocument(collectionPath, id)
  }

  return {
    createKitchenSupplierIngredient,
    updateKitchenSupplierIngredient,
    deleteKitchenSupplierIngredient,
  }
}
