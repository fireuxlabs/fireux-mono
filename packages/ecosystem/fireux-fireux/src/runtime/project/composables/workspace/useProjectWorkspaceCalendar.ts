import { computed } from 'vue'
import { useWorkspaceCalendar } from 'fireux-core/runtime/workspace/composables/useWorkspaceCalendar'
import { useProjectWorkspace } from './useProjectWorkspace'

/** Project's required Calendar entrance; shared behaviour stays in Core. */
export function useProjectWorkspaceCalendar() {
  const workspace = useProjectWorkspace()
  return {
    ...useWorkspaceCalendar(workspace),
    outcome: workspace.outcome,
    ready: computed(() => workspace.data.value?.identity.status === 'active'),
  }
}
