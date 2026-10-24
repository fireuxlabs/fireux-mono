import { watch, type Ref } from 'vue'
import { useCalendar } from '../../composables/shared/useCalendar'

/** Calendar view state follows the selected Entity, without owning its events. */
export function useWorkspaceCalendar(options: {
  id: Ref<string>
  outcome: Ref<string>
}) {
  const calendar = useCalendar()
  watch(options.id, () => calendar.resetDate(), { flush: 'sync' })
  return { ...calendar, outcome: options.outcome }
}
