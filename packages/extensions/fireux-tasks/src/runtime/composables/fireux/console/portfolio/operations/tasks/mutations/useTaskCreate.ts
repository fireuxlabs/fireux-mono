import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import type { Task, TaskCreateInput } from '../../../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

export function useTaskCreate(runtimePortfolio = useActivePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const collectionPath = usePortfolioConsoleChildPath(runtimePortfolio, 'tasks')

  async function createTask(input: TaskCreateInput): Promise<string> {
    const portfolioId = normalize(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-tasks] portfolio id is required.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-tasks] demo runtime does not allow writes.')
    }

    const title = normalize(input.title)
    if (!title) {
      throw new Error('[fireux-tasks] title is required.')
    }

    const payload: Omit<Task, 'id'> = {
      portfolio_id: portfolioId,
      title,
      description: normalize(input.description),
      status: input.status || 'open',
      source: input.source || 'manual',
      due_date: normalize(input.due_date),
      linked_entity_type: normalize(input.linked_entity_type),
      linked_entity_id: normalize(input.linked_entity_id),
      created: { at: {} as any, by: undefined, app_id: undefined },
      updated: { at: {} as any, by: undefined },
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-tasks] runtime task path is required.')
    }

    return createDocument<Omit<Task, 'id'>>(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })
  }

  return {
    createTask,
  }
}
