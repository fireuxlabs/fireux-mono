import { useWorkspaceTeam } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceTeam() {
  const { selection, runtime } = useSupplierWorkspace()
  const team = useWorkspaceTeam({
    target: selection.supplier,
    targetId: selection.supplierId,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
  })

  return {
    ...team,
    supplier: selection.supplier,
    supplierId: selection.supplierId,
  }
}
