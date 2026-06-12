import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { resolveKitchenScopeCollectionPath } from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenMiseTaskStorage,
  type KitchenMiseTask,
} from '../../../../../../../models/kitchen-mise.model'

type ToggleKitchenMiseDoneInput = {
  kitchenId: string
  taskId: string
  done: boolean
  kitchenCollectionPath?: string
}

const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/${KitchenMiseTaskStorage.collection}`

export function useKitchenMiseToggleDone() {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()

  const toggleKitchenMiseDone = async (input: ToggleKitchenMiseDoneInput) => {
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

    await updateDocument<KitchenMiseTask>(collectionPath, taskId, {
      status: input.done ? 'done' : 'todo',
    })
  }

  return { toggleKitchenMiseDone }
}
