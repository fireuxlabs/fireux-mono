import { computed } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceTeam() {
  const { selection, runtime } = useSupplierWorkspace()
  const teamIds = computed(() => targetTeamIds(selection.supplier.value))
  const operatorIds = computed(() =>
    targetOperatorIds(selection.supplier.value)
  )
  const accessIds = computed(() => targetAccessIds(selection.supplier.value))
  const debug = computed(() => ({
    teamIds: teamIds.value,
    operatorIds: operatorIds.value,
    accessIds: accessIds.value,
  }))

  return {
    teamIds,
    operatorIds,
    accessIds,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    debug,
    supplier: selection.supplier,
    supplierId: selection.supplierId,
  }
}
