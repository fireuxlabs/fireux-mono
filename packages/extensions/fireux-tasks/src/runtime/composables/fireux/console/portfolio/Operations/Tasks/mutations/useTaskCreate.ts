// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require Portfolio operator access for task creation.
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  requirePortfolioConsoleWrite,
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { TaskStorage, type Task, type TaskCreateInput } from '../../../../../../../models/task.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useTaskCreate(runtimePortfolio = useActivePortfolio()) {
  const create = useFirestoreClientCreate()
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    TaskStorage.collection
  )

  async function createTask(input: TaskCreateInput): Promise<string> {
    const portfolioId = requirePortfolioConsoleWrite(
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

    return create(
      defineRuntimeClientCreateTarget(
        'project.portfolio.tasks',
        collectionPath.value
      ),
      payload,
      { stamp: true, creator: true, app: true }
    )
  }

  return {
    createTask,
  }
}
