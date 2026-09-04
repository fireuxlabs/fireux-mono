// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require Portfolio operator access for task creation.
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import {
  TaskStorage,
  type Task,
  type TaskCreateInput,
} from '../../../../../models/task.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useTaskCreate(runtimePortfolio = useActivePortfolio()) {
  const { createDocument: create } = useFirestoreCreate()
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  async function createTask(input: TaskCreateInput): Promise<string> {
    const portfolioId = requirePortfolioWorkspaceWrite(
      runtimePortfolio,
      'fireux-tasks'
    )

    const title = normalizeString(input.title)
    if (!title) {
      throw new Error('[fireux-tasks] title is required.')
    }

    const payload: Omit<Task, 'id'> = {
      portfolio_id: portfolioId,
      title,
      description: normalizeString(input.description),
      status: input.status || 'open',
      source: input.source || 'manual',
      due_date: normalizeString(input.due_date),
      linked_entity_type: normalizeString(input.linked_entity_type),
      linked_entity_id: normalizeString(input.linked_entity_id),
      created: { at: {} as any, by: undefined, app_id: undefined },
      updated: { at: {} as any, by: undefined },
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-tasks] runtime task path is required.')
    }

    return create(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createTask,
  }
}
