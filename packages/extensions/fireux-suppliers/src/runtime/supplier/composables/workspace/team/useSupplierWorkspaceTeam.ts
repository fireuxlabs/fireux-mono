import { useTeam } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceTeam() {
  const { selection, runtime } = useSupplierWorkspace()
  const team = useTeam({
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
