import { computed } from 'vue'
import { useConsoleTeam } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTeam'
import { useProjectConsole } from '../core/useProjectConsole'

/**
 * Project has no team lifecycle today. This existing console bucket exposes
 * only explicit root Project operator access.
 */
export function useProjectConsoleTeam() {
  const { selection, runtime } = useProjectConsole()
  const team = useConsoleTeam({
    target: selection.project,
    targetId: selection.projectId,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
  })

  return {
    ...team,
    teamIds: computed<string[]>(() => []),
    accessIds: team.operatorIds,
    project: selection.project,
    projectId: selection.projectId,
  }
}
