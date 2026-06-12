import { useConsoleTeam } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTeam'
import { useProjectConsole } from '../core/useProjectConsole'

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
    project: selection.project,
    projectId: selection.projectId,
  }
}
