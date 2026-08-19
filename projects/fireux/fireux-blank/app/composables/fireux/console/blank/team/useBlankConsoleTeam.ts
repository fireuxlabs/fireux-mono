import { useConsoleTeam } from 'fireux-core/runtime/composables/fireux/console/useConsoleTeam'
import { useBlankConsole } from '../core/useBlankConsole'

export function useBlankConsoleTeam() {
  const { selection, runtime } = useBlankConsole()
  const team = useConsoleTeam({
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
