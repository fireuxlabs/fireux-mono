import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import type { Task } from '../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

export function useTaskUpdate(runtimePortfolio = useRuntimePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = useRuntimePortfolioPath(runtimePortfolio, 'tasks')

  async function updateTask(taskId: string, patch: Partial<Omit<Task, 'id'>>): Promise<void> {
    const portfolioId = normalize(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-tasks] runtimePortfolioId is required.')
    }

    if (runtimePortfolio.isReadOnly.value) {
      throw new Error('[fireux-tasks] read-only runtime does not allow writes.')
    }

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
