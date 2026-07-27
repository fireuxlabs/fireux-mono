import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import {
  KitchenMiseTaskStorage,
  normalizeKitchenMisePriority,
  normalizeKitchenMiseStatus,
  normalizeKitchenMiseWorkflowStage,
  type KitchenMiseTaskUpdateInput,
  type KitchenMiseTask,
} from '../../../../../../../models/kitchen/mise.model'

type UpdateKitchenMiseInput = {
  kitchenId: string
  taskId: string
  kitchenCollectionPath?: string
  patch: {
    title?: string
    description?: string
    station?: string
    workflow_stage?: KitchenMiseTask['workflow_stage']
    service_date?: string
    status?: KitchenMiseTask['status']
    priority?: KitchenMiseTask['priority']
    estimated_minutes?: number
  }
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const nonNegativeInteger = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0
}

export function useKitchenMiseUpdate() {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { updateDocument } = useFirestoreUpdate()

  const updateKitchenMise = async (input: UpdateKitchenMiseInput) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId)
    const taskId = normalizeString(input.taskId)
    const rootCollection = normalizeString(input.kitchenCollectionPath)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!taskId) throw new Error('Mise task id is required')
    if (!rootCollection) throw new Error('Kitchen collection path is required')

    const patch: KitchenMiseTaskUpdateInput = {}
    if ('title' in input.patch) {
      patch.title = normalizeString(input.patch.title)
    }
    if ('description' in input.patch) {
      patch.description = normalizeString(input.patch.description)
    }
    if ('station' in input.patch) {
      patch.station = normalizeString(input.patch.station)
    }
    if ('workflow_stage' in input.patch) {
      patch.workflow_stage = normalizeKitchenMiseWorkflowStage(
        input.patch.workflow_stage
      )
    }
    if ('service_date' in input.patch) {
      patch.service_date = normalizeString(input.patch.service_date)
    }
    if ('status' in input.patch) {
      patch.status = normalizeKitchenMiseStatus(input.patch.status)
    }
    if ('priority' in input.patch) {
      patch.priority = normalizeKitchenMisePriority(input.patch.priority)
    }
    if ('estimated_minutes' in input.patch) {
      patch.estimated_minutes = nonNegativeInteger(
        input.patch.estimated_minutes
      )
    }

    await updateDocument<KitchenMiseTask>(
      `${rootCollection}/${kitchenId}/${KitchenMiseTaskStorage.collection}`,
      taskId,
      patch
    )
  }

  return { updateKitchenMise }
}
