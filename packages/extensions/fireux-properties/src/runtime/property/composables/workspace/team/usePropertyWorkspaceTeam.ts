import { computed } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'

export function usePropertyWorkspaceTeam() {
  const { selection, runtime } = usePropertyWorkspace()
  const teamIds = computed(() => targetTeamIds(selection.property.value))
  const operatorIds = computed(() =>
    targetOperatorIds(selection.property.value)
  )
  const accessIds = computed(() => targetAccessIds(selection.property.value))
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
    property: selection.property,
    propertyId: selection.propertyId,
  }
}
