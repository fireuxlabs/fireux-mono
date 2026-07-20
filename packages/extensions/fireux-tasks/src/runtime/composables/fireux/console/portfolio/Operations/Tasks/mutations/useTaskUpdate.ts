// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for task updates.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { TaskStorage, type Task } from '../../../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

export function useTaskUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  async function updateTask(taskId: string, patch: Partial<Omit<Task, 'id'>>): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-tasks')

    const normalizedTaskId = normalize(taskId)
    if (!normalizedTaskId) {
      throw new Error('[fireux-tasks] taskId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-tasks] runtime task path is required.')
    }

    await updateDocument<Omit<Task, 'id'>>(collectionPath.value, normalizedTaskId, patch)
  }

  return {
    updateTask,
  }
}
