import { computed } from 'vue'
import { getReadOnlySupplierScenarios } from './read-only-scenarios'
import { useRuntimeSupplierSelection } from './state'
import { useRuntimeSupplier } from './useRuntimeSupplier'

/**
 * Demo-only supplier console.
 */
export function useRuntimeSupplierConsole() {
  const runtime = useRuntimeSupplier()
  const { setRuntimeSupplier } = useRuntimeSupplierSelection()
  const scenarios = computed(getReadOnlySupplierScenarios)

  const setActiveSupplier = (supplierId: string) => {
    const resolvedId = String(supplierId || '').trim()
    if (!resolvedId) return
    setRuntimeSupplier({
      supplierId: resolvedId,
      mode: 'read-only',
    })
  }

  return {
    runtime,
    scenarios,
    setActiveSupplier,
  }
}
