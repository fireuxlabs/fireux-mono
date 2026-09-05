import { computed } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'

export function usePropertyWorkspaceTeam() {
  const workspace = usePropertyWorkspace()
  const teamIds = computed(() => targetTeamIds(workspace.data.value))
  const operatorIds = computed(() =>
    targetOperatorIds(workspace.data.value)
  )
  const accessIds = computed(() => targetAccessIds(workspace.data.value))

  return {
    teamIds,
    operatorIds,
    accessIds,
    property: workspace.data,
    propertyId: workspace.id,
  }
}
