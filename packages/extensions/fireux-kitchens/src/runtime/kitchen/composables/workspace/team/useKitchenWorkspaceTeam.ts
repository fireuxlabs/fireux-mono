import { useKitchenWorkspaceIndex } from '../index/useKitchenWorkspaceIndex'
import { provideKitchenTeamContext } from './useKitchenTeamContext'

export function useKitchenWorkspaceTeam() {
  const workspace = useKitchenWorkspaceIndex()
  provideKitchenTeamContext()
  return workspace
}
