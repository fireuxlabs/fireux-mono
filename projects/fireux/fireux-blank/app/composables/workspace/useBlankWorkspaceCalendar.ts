import { useBlankWorkspace } from './useBlankWorkspace'
import { useWorkspaceCalendar } from 'fireux-core/runtime/workspace/composables/useWorkspaceCalendar'

export function useBlankWorkspaceCalendar() {
  const workspace = useBlankWorkspace()
  return { ...useWorkspaceCalendar(workspace), connected: false }
}
