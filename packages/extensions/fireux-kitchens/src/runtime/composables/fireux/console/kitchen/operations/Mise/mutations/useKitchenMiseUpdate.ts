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
  changes: {
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
    if ('title' in input.changes) {
      patch.title = normalizeString(input.changes.title)
    }
    if ('description' in input.changes) {
      patch.description = normalizeString(input.changes.description)
    }
    if ('station' in input.changes) {
      patch.station = normalizeString(input.changes.station)
    }
    if ('workflow_stage' in input.changes) {
      patch.workflow_stage = normalizeKitchenMiseWorkflowStage(
        input.changes.workflow_stage
      )
    }
    if ('service_date' in input.changes) {
      patch.service_date = normalizeString(input.changes.service_date)
    }
    if ('status' in input.changes) {
      patch.status = normalizeKitchenMiseStatus(input.changes.status)
    }
    if ('priority' in input.changes) {
      patch.priority = normalizeKitchenMisePriority(input.changes.priority)
    }
    if ('estimated_minutes' in input.changes) {
      patch.estimated_minutes = nonNegativeInteger(
        input.changes.estimated_minutes
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
