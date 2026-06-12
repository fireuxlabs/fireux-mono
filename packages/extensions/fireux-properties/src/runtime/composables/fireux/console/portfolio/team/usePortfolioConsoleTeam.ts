import { useConsoleTeam } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTeam'
import { usePortfolioConsole } from '../core/usePortfolioConsole'

export function usePortfolioConsoleTeam() {
  const { selection, runtime } = usePortfolioConsole()
  const team = useConsoleTeam({
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
