import { useProjectWorkspaceIndex } from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'
import { provideProjectTeamContext } from 'fireux-core/runtime/project/composables/workspace/team/useProjectTeamContext'

export function useProjectWorkspaceTeam() {
  const workspace = useProjectWorkspaceIndex()
  provideProjectTeamContext()
  return workspace
}
