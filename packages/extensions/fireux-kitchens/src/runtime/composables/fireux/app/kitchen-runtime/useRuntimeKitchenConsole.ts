import { computed } from 'vue'
import { getReadOnlyKitchenScenarios } from './read-only-scenarios'
import { useRuntimeKitchenSelection } from './state'
import { useRuntimeKitchen } from './useRuntimeKitchen'

/**
 * Demo-only kitchen console.
 */
export function useRuntimeKitchenConsole() {
  const runtime = useRuntimeKitchen()
  const { setRuntimeKitchen } = useRuntimeKitchenSelection()
  const scenarios = computed(getReadOnlyKitchenScenarios)

  const setActiveKitchen = (kitchenId: string) => {
    const resolvedId = String(kitchenId || '').trim()
    if (!resolvedId) return
    setRuntimeKitchen({
      kitchenId: resolvedId,
      mode: 'read-only',
    })
  }

  return {
    runtime,
    scenarios,
    setActiveKitchen,
  }
}
