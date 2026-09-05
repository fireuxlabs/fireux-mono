import { computed } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'

export function usePortfolioWorkspaceTeam() {
  const workspace = usePortfolioWorkspace()
  const teamIds = computed(() => targetTeamIds(workspace.data.value))
  const operatorIds = computed(() =>
    targetOperatorIds(workspace.data.value)
  )
  const accessIds = computed(() => targetAccessIds(workspace.data.value))

  return {
    teamIds,
    operatorIds,
    accessIds,
    portfolio: workspace.data,
    portfolioId: workspace.id,
  }
}
