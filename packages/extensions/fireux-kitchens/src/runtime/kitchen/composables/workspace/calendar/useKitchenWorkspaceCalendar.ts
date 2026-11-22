import { useWorkspaceCalendar } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceCalendar'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

/** Kitchen's required Calendar entrance; event integration belongs here. */
export function useKitchenWorkspaceCalendar() {
  const workspace = useKitchenWorkspace()
  return useWorkspaceCalendar(workspace)
}
