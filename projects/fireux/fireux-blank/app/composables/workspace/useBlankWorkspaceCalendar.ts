import { useBlankWorkspace } from './useBlankWorkspace'
import { useWorkspaceCalendar } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceCalendar'

export function useBlankWorkspaceCalendar() {
  const workspace = useBlankWorkspace()
  return { ...useWorkspaceCalendar(workspace), connected: false }
}
