import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { unref, type Ref } from 'vue'
import {
  KitchenCostSnapshotStorage,
  type KitchenCostSnapshot,
  type KitchenCostSnapshotCreateInput,
  type KitchenCostSnapshotUpdateInput,
} from '../../../../../../../models/kitchen-cost.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../collections/useKitchenChildCollection'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenCostSnapshotMutations(options: Options = {}) {
  const { appId } = useFireUXConfig()
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })

  const path = (kitchenId: string) =>
    resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId,
      collectionName: KitchenCostSnapshotStorage.collection,
      appId,
    })

  const createKitchenCostSnapshot = async (
    input: KitchenCostSnapshotCreateInput
  ) => {
    const kitchenId = normalizeString(input.kitchen_id)
    const collectionPath = path(kitchenId)
    if (!collectionPath) throw new Error('Kitchen id is required')

    return createDocument<Partial<KitchenCostSnapshot>>(
      collectionPath,
      {
        ...input,
        kitchen_id: kitchenId,
      },
      { app: true, creator: true }
    )
  }

  const updateKitchenCostSnapshot = async (
    kitchenId: string,
    costId: string,
    patch: KitchenCostSnapshotUpdateInput
  ) => {
    const collectionPath = path(kitchenId)
    const id = normalizeString(costId)
    if (!collectionPath || !id) throw new Error('Missing cost snapshot')
    await updateDocument<KitchenCostSnapshot>(collectionPath, id, patch)
  }

  const deleteKitchenCostSnapshot = async (kitchenId: string, costId: string) => {
    const collectionPath = path(kitchenId)
    const id = normalizeString(costId)
    if (!collectionPath || !id) throw new Error('Missing cost snapshot')
    await deleteDocument(collectionPath, id)
  }

  return {
    createKitchenCostSnapshot,
    updateKitchenCostSnapshot,
    deleteKitchenCostSnapshot,
  }
}
