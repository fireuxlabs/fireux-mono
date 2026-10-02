import { useActivePortfolio } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import type { TaskUpdateInput } from '../../../../../models/task.model'
import { useTaskMutation } from '../../../../useTaskMutation'
export function useTaskUpdate(portfolio = useActivePortfolio()) {
  const mutate = useTaskMutation(portfolio)
  return { updateTask: async (input: { taskId: string; changes: TaskUpdateInput }): Promise<void> => { await mutate('PATCH', input) } }
}
