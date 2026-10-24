import { useCalendar } from 'fireux-core/runtime/workspace/composables/useCalendar'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

/** Kitchen's required Calendar entrance; event integration belongs here. */
export function useKitchenCalendar() {
  const workspace = useKitchenWorkspace()
  return { ...useCalendar(), outcome: workspace.outcome }
}
