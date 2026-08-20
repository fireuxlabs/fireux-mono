import { useWorkspaceTeam } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import { useBlankWorkspace } from '../core/useBlankWorkspace'

export function useBlankWorkspaceTeam() {
  const { selection, runtime } = useBlankWorkspace()
  const team = useWorkspaceTeam({
    target: selection.blank,
    targetId: selection.blankId,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
  })

  return {
    ...team,
    blank: selection.blank,
    blankId: selection.blankId,
  }
}
