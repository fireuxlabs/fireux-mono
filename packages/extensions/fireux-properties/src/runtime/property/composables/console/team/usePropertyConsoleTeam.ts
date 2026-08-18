import { useConsoleTeam } from 'fireux-core/runtime/composables/fireux/console/useConsoleTeam'
import { usePropertyConsole } from '../core/usePropertyConsole'

export function usePropertyConsoleTeam() {
  const { selection, runtime } = usePropertyConsole()
  const team = useConsoleTeam({
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
