import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { unref, type Ref } from 'vue'
import {
  KitchenSupplierIngredientStorage,
  type KitchenSupplierIngredient,
  type KitchenSupplierIngredientCreateInput,
  type KitchenSupplierIngredientUpdateInput,
} from '../../../../../../../models/ingredient.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../Collections/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenSupplierIngredientMutations(options: Options = {}) {
  const { appId } = useFireUXConfig()
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })
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
    const kitchenId = normalizeString(input.kitchen_id)
    const supplierId = normalizeString(input.supplier_id)
    const ingredientId = normalizeString(input.ingredient_id)
    const collectionPath = path(kitchenId)

    if (!collectionPath) throw new Error('Kitchen id is required')
    if (!supplierId) throw new Error('Supplier id is required')
    if (!ingredientId) throw new Error('Ingredient id is required')

    return createDocument<Partial<KitchenSupplierIngredient>>(
      collectionPath,
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
    const collectionPath = path(kitchenId)
    const id = normalizeString(supplierIngredientId)
    if (!collectionPath || !id) throw new Error('Missing supplier ingredient')
    await updateDocument<KitchenSupplierIngredient>(collectionPath, id, patch)
  }

  const deleteKitchenSupplierIngredient = async (
    kitchenId: string,
    supplierIngredientId: string
  ) => {
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
