import { computed } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'

export function usePortfolioWorkspaceTeam() {
  const { selection, runtime } = usePortfolioWorkspace()
  const teamIds = computed(() => targetTeamIds(selection.portfolio.value))
  const operatorIds = computed(() =>
    targetOperatorIds(selection.portfolio.value)
  )
  const accessIds = computed(() => targetAccessIds(selection.portfolio.value))
  const debug = computed(() => ({
    teamIds: teamIds.value,
    operatorIds: operatorIds.value,
    accessIds: accessIds.value,
  }))

  return {
    teamIds,
    operatorIds,
    accessIds,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    debug,
    portfolio: selection.portfolio,
    portfolioId: selection.portfolioId,
  }
}
