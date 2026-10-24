import { computed } from 'vue'
import { useCalendar } from 'fireux-core/runtime/workspace/composables/useCalendar'
import { useProjectWorkspace } from '../useProjectWorkspace'

/** Project's required Calendar entrance; shared behaviour stays in Core. */
export function useProjectCalendar() {
  const workspace = useProjectWorkspace()
  return {
    ...useCalendar(),
    outcome: workspace.outcome,
    ready: computed(() => workspace.data.value?.identity.status === 'active'),
  }
}
