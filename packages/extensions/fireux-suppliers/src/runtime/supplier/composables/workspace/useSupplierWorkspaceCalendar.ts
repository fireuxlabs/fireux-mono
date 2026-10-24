import { useSupplierWorkspace } from './useSupplierWorkspace'
import { useWorkspaceCalendar } from 'fireux-core/runtime/workspace/composables/useWorkspaceCalendar'

export function useSupplierWorkspaceCalendar() {
  const workspace = useSupplierWorkspace()
  return { ...useWorkspaceCalendar(workspace), connected: false }
}
