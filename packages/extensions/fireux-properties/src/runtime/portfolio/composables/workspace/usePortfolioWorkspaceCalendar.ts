import { usePortfolioWorkspace } from './usePortfolioWorkspace'
import { useWorkspaceCalendar } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceCalendar'

export function usePortfolioWorkspaceCalendar() {
  const workspace = usePortfolioWorkspace()
  return { ...useWorkspaceCalendar(workspace), connected: false }
}
