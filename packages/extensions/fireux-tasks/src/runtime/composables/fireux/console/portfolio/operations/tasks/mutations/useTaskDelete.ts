import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { TaskStorage } from '../../../../../../../models/task.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useTaskDelete(runtimePortfolio = useActivePortfolio()) {
  const { deleteDocument } = useFirestoreDelete()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  async function deleteTask(taskId: string): Promise<void> {
    const portfolioId = normalizeString(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-tasks] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-tasks] demo runtime does not allow writes.')
    }

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
