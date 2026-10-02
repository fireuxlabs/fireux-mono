import { useActivePortfolio } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import type { TaskCreateInput } from '../../../../../models/task.model'
import { useTaskMutation } from '../../../../useTaskMutation'
export function useTaskCreate(portfolio = useActivePortfolio()) {
  const mutate = useTaskMutation(portfolio)
  return { createTask: async (draft: TaskCreateInput): Promise<string> => (await mutate<{ id: string }>('POST', { draft })).id }
}
