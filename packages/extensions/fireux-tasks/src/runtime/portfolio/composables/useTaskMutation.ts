import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { requirePortfolioWorkspaceWrite, type ActivePortfolioRuntime } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { useTaskScope } from './useTaskScope'

export function useTaskMutation(portfolio: ActivePortfolioRuntime) {
  const { currentUser } = useAuth(), captureScope = useTaskScope(portfolio)
  return async (method: 'POST' | 'PATCH', input: Record<string, unknown>) => {
    const portfolioId = requirePortfolioWorkspaceWrite(portfolio, 'fireux-tasks')
    const body = JSON.parse(JSON.stringify({ ...input, portfolioId }))
    const uid = currentUser.value?.uid, isCurrent = captureScope()
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent()) throw new Error('The account or Portfolio changed. Reopen Tasks.')
      requirePortfolioWorkspaceWrite(portfolio, 'fireux-tasks')
    }
    const user = await useRequireUser(); assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Tasks.')
    const token = await user.getIdToken(); assertScope()
    const result = await $fetch<{ id: string; portfolioId: string; ok: true }>('/api/workspace/portfolio/tasks', { method, headers: { Authorization: `Bearer ${token}` }, body })
    if (!result?.id || result.portfolioId !== portfolioId || result.ok !== true || (method === 'PATCH' && result.id !== body.taskId)) throw new Error('Task response did not match the requested Portfolio and Task.')
    return result
  }
}
