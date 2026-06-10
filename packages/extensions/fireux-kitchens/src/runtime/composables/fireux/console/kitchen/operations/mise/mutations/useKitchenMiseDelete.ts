import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { KitchenMiseTaskStorage } from '../../../../../../../models/kitchen-mise.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../Collections/useKitchenChildCollection'

export function useKitchenMiseDelete(options: {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
} = {}) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  async function deleteKitchenMiseTask(kitchenId: string, taskId: string) {
    const resolvedKitchenId = normalizeString(kitchenId)
    const resolvedTaskId = normalizeString(taskId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')
    if (!resolvedTaskId) throw new Error('Mise task id is required')

    const collectionPath = resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId,
      collectionName: KitchenMiseTaskStorage.collection,
      appId,
    })

    await deleteDocument(collectionPath, resolvedTaskId)
  }

  return { deleteKitchenMiseTask }
}
