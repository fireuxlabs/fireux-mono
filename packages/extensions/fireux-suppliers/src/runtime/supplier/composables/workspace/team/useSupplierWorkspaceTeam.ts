import { computed } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceTeam() {
  const workspace = useSupplierWorkspace()
  const teamIds = computed(() => targetTeamIds(workspace.data.value))
  const operatorIds = computed(() =>
    targetOperatorIds(workspace.data.value)
  )
  const accessIds = computed(() => targetAccessIds(workspace.data.value))

  return {
    teamIds,
    operatorIds,
    accessIds,
    supplier: workspace.data,
    supplierId: workspace.id,
  }
}
