// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require Portfolio operator access for task updates.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/operations/useActivePortfolio'
import { TaskStorage, type Task } from '../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

export function useTaskUpdate(runtimePortfolio = useActivePortfolio()) {
  const { updateDocument } = useFirestoreUpdate()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  async function updateTask(input: {
    taskId: string
    changes: Partial<Omit<Task, 'id'>>
  }): Promise<void> {
    requirePortfolioWorkspaceWrite(runtimePortfolio, 'fireux-tasks')

    const normalizedTaskId = normalize(input.taskId)
    if (!normalizedTaskId) {
      throw new Error('[fireux-tasks] taskId is required.')
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-tasks] runtime task path is required.')
    }

    await updateDocument<Omit<Task, 'id'>>(
      collectionPath.value,
      normalizedTaskId,
      input.changes
    )
  }

  return {
    updateTask,
  }
}
