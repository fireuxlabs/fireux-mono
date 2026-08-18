// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for task deletion.
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/portfolio/composables/console/operations/useActivePortfolio'
import { TaskStorage } from '../../../../../models/task.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useTaskDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  async function deleteTask(taskId: string): Promise<void> {
    requirePortfolioConsoleWrite(runtimePortfolio, 'fireux-tasks')

    const normalizedTaskId = normalizeString(taskId)
    if (!normalizedTaskId) {
      throw new Error('[fireux-tasks] taskId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-tasks] runtime task path is required.')
    }

    await deleteDocument(collectionPath.value, normalizedTaskId)
  }

  return {
    deleteTask,
  }
}
