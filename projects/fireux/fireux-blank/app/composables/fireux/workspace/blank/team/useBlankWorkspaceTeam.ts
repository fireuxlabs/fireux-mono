import { computed } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useBlankWorkspace } from '../core/useBlankWorkspace'

export function useBlankWorkspaceTeam() {
  const workspace = useBlankWorkspace()
  const teamIds = computed(() => targetTeamIds(workspace.data.value))
  const operatorIds = computed(() => targetOperatorIds(workspace.data.value))
  const accessIds = computed(() => targetAccessIds(workspace.data.value))

  return {
    teamIds,
    operatorIds,
    accessIds,
    blank: workspace.data,
    blankId: workspace.id,
  }
}
