import { computed } from 'vue'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../../models/kitchen.model'
import { getReadOnlyKitchenScenarios } from './read-only-scenarios'
import { useRuntimeKitchenSelection } from './state'
import { useRuntimeKitchen } from './useRuntimeKitchen'

/**
 * Demo-only kitchen console.
 */
export function useRuntimeKitchenConsole() {
  const runtime = useRuntimeKitchen()
  const { interface: kitchenInterface } = useKitchenInterface()
  const { setRuntimeKitchen } = useRuntimeKitchenSelection()
  const scenarios = computed(() => getReadOnlyKitchenScenarios())
  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) => {
        const pill = kitchenInterface({
          ...(entry.kitchen ?? {}),
          id: String((entry.kitchen as any)?.id || '').trim() || String((entry as any)?.id || '').trim(),
        } as Kitchen)

        if (!pill) return null

        return {
          ...pill,
          imageUrl:
            pill.imageUrl ||
            String((entry.kitchen as any)?.image_url || '').trim() ||
            String((entry as any)?.image_url || '').trim(),
        }
      })
      .filter((entry): entry is NonNullable<ReturnType<typeof kitchenInterface>> => Boolean(entry))
  )

  const activeKitchen = computed<Kitchen | null>(() => {
    const currentId = String(runtime.id.value || '').trim()
    if (!currentId) return null

    const scenario = scenarios.value.find((entry) => {
      const scenarioId = String((entry.kitchen as any)?.id || entry.id || '').trim()
      return scenarioId === currentId
    })

    return scenario?.kitchen ?? null
  })
  const activeKitchenPill = computed(() =>
    activeKitchen.value ? kitchenInterface(activeKitchen.value as Kitchen) : null
  )
  const hasActiveKitchen = computed(() => activeKitchen.value !== null)
  const showSelector = computed(() => scenarios.value.length > 1)

  const setActiveScenario = (kitchenId: string) => {
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
    scenarioPills,
    activeKitchen,
    activeKitchenPill,
    hasActiveKitchen,
    showSelector,
    pending: computed(() => false),
    setActiveScenario,
  }
}
