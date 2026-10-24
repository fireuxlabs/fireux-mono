import { usePortfolioScope } from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import type { TaskCreateInput } from '../../models/task.model'
import { useTaskMutation } from '../useTaskMutation'
export function useTaskCreate(portfolio: ReturnType<typeof usePortfolioScope>) {
  const mutate = useTaskMutation(portfolio)
  return {
    createTask: async (draft: TaskCreateInput): Promise<string> =>
      (await mutate('POST', { draft })).id,
  }
}
