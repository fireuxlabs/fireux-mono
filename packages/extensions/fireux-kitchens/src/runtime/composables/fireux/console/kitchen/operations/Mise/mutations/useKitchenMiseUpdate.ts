import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  KitchenMiseTaskStorage,
  type KitchenMiseTask,
} from '../../../../../../../models/kitchen-mise.model'

type UpdateKitchenMiseInput = {
  kitchenId: string
  taskId: string
  kitchenCollectionPath?: string
  patch: {
    title?: string
    description?: string
    type?: 'food' | 'non-food'
    station?: string
  }
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
export function useKitchenMiseUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  const updateKitchenMise = async (input: UpdateKitchenMiseInput) => {
    const kitchenId = normalizeString(input.kitchenId)
    const taskId = normalizeString(input.taskId)
    const rootCollection = normalizeString(input.kitchenCollectionPath)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!taskId) throw new Error('Mise task id is required')
    if (!rootCollection) throw new Error('Kitchen collection path is required')

    const patch: Partial<KitchenMiseTask> & Record<string, unknown> = {
      title: normalizeString(input.patch.title),
      description: normalizeString(input.patch.description),
      type: input.patch.type,
      station: normalizeString(input.patch.station),
    }

    await updateDocument<KitchenMiseTask>(
      `${rootCollection}/${kitchenId}/${KitchenMiseTaskStorage.collection}`,
      taskId,
      patch
    )
  }

  return { updateKitchenMise }
}
