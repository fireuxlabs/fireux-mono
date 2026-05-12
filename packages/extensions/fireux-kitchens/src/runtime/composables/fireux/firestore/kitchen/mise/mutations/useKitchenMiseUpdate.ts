import { computed } from 'vue'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { KitchenMiseTask } from '../../../../../../models/kitchen-mise.model'

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
const requireSimulationDatabaseId = () => {
  const databaseId = readRuntimeSimulationFirestoreDatabaseId()
  if (!databaseId) {
    throw new Error(
      'Missing firebase.simulationDatabaseId for kitchen test-mode mise writes.'
    )
  }
  return databaseId
}

export function useKitchenMiseUpdate() {
  const databaseId = computed(() => requireSimulationDatabaseId())
  const { updateDocument } = useFirestoreUpdate({ databaseId })

  const updateKitchenMise = async (input: UpdateKitchenMiseInput) => {
    const kitchenId = normalizeString(input.kitchenId)
    const taskId = normalizeString(input.taskId)
    const rootCollection = normalizeString(input.kitchenCollectionPath)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!taskId) throw new Error('Mise task id is required')
    if (rootCollection !== 'kitchens') {
      throw new Error('Mise task edits are only enabled for test kitchens.')
    }

    const patch: Partial<KitchenMiseTask> & Record<string, unknown> = {
      title: normalizeString(input.patch.title),
      description: normalizeString(input.patch.description),
      type: input.patch.type,
      station: normalizeString(input.patch.station),
    }

    await updateDocument<KitchenMiseTask>(
      `${rootCollection}/${kitchenId}/mise`,
      taskId,
      patch
    )
  }

  return { updateKitchenMise }
}
