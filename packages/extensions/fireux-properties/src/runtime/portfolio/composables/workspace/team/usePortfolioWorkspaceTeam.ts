import { useWorkspaceTeam } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'

export function usePortfolioWorkspaceTeam() {
  const { selection, runtime } = usePortfolioWorkspace()
  const team = useWorkspaceTeam({
    target: selection.portfolio,
    targetId: selection.portfolioId,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
  })

  return {
    ...team,
    portfolio: selection.portfolio,
    portfolioId: selection.portfolioId,
  }
}
