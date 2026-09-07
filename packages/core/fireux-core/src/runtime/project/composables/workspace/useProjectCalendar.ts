import { computed } from 'vue'
import { useCalendar } from '../../../composables/fireux/workspace/useCalendar'
import { useProjectWorkspace } from './core/useProjectWorkspace'

/** Project's required Calendar entrance; shared behaviour stays in Core. */
export function useProjectCalendar() {
  const workspace = useProjectWorkspace()
  return {
    ...useCalendar(),
    outcome: workspace.outcome,
    ready: computed(() => workspace.data.value?.status === 'active'),
  }
}
