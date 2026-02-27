import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useRuntimePortfolio } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import type { Task } from '../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

export function useTaskUpdate(runtimePortfolio = useRuntimePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()

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

    await updateDocument<Omit<Task, 'id'>>(
      `portfolios/${portfolioId}/tasks`,
      normalizedTaskId,
      patch
    )
  }

  return {
    updateTask,
  }
}
