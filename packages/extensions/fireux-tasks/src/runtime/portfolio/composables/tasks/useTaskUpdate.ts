import { usePortfolioScope } from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import type { TaskUpdateInput } from '../../models/task.model'
import { useTaskMutation } from '../useTaskMutation'
export function useTaskUpdate(portfolio: ReturnType<typeof usePortfolioScope>) {
  const mutate = useTaskMutation(portfolio)
  return {
    updateTask: async (input: {
      taskId: string
      changes: TaskUpdateInput
    }): Promise<void> => {
      await mutate('PATCH', input)
    },
  }
}
