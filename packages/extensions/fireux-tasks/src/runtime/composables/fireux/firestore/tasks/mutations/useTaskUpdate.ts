import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  useActivePortfolio,
  useRuntimePortfolioPath,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-console/useActivePortfolio'
import type { Task } from '../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

export function useTaskUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = useRuntimePortfolioPath(runtimePortfolio, 'tasks')

  async function updateTask(taskId: string, patch: Partial<Omit<Task, 'id'>>): Promise<void> {
    const portfolioId = normalize(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-tasks] runtimePortfolioId is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-tasks] demo runtime does not allow writes.')
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
