import { useConsoleTeam } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTeam'
import { useSupplierConsole } from '../core/useSupplierConsole'

export function useSupplierConsoleTeam() {
  const { selection, runtime } = useSupplierConsole()
  const team = useConsoleTeam({
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
