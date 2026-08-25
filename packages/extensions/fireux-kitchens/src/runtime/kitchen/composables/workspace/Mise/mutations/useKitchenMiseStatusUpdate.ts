import { serverTimestamp } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { resolveKitchenScopeCollectionPath } from '../../../firestore/utils/paths/useKitchenChildCollection'
import {
  KitchenMiseTaskStorage,
  KitchenMiseTaskDefaults,
  normalizeKitchenMiseStatus,
  type KitchenMiseStatus,
  type KitchenMiseTask,
} from '../../../../utils/mise.ts'

type UpdateKitchenMiseStatusInput = {
  kitchenId: string
  taskId: string
  status: KitchenMiseStatus
  kitchenCollectionPath?: string
}

const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${KitchenMiseTaskStorage.collection}`

export function useKitchenMiseStatusUpdate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()

  const updateKitchenMiseStatus = async (
    input: UpdateKitchenMiseStatusInput
  ) => {
    requireWritableData()
    const kitchenId = String(input.kitchenId || '').trim()
    const taskId = String(input.taskId || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!taskId) throw new Error('Mise task id is required')

    const kitchenCollectionPath =
      String(input.kitchenCollectionPath || '').trim() ||
      resolveKitchenScopeCollectionPath(appId)
    const collectionPath = resolveKitchenCollectionPath(
      kitchenCollectionPath,
      kitchenId
    )
    const status = normalizeKitchenMiseStatus(input.status)

    await updateDocument<KitchenMiseTask>(collectionPath, taskId, {
      status,
      completed_at:
        status === 'done'
          ? (serverTimestamp() as never)
          : KitchenMiseTaskDefaults.completed_at,
    })
  }

  return { updateKitchenMiseStatus }
}
