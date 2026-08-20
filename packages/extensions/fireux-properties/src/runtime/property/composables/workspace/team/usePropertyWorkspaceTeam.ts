import { useWorkspaceTeam } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'

export function usePropertyWorkspaceTeam() {
  const { selection, runtime } = usePropertyWorkspace()
  const team = useWorkspaceTeam({
    target: selection.property,
    targetId: selection.propertyId,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
  })

  return {
    ...team,
    property: selection.property,
    propertyId: selection.propertyId,
  }
}
