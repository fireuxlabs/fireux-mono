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
  const scenarios = computed(getReadOnlyKitchenScenarios)

  const toKitchenPill = (
    kitchen: Partial<Kitchen> | null | undefined,
    options: { id?: string; imageUrl?: unknown } = {}
  ) => {
    const pill = kitchenInterface({
      ...(kitchen ?? {}),
      ...(options.id ? { id: options.id } : {}),
    } as Kitchen)

    if (!pill) return null

    const imageUrl = String(options.imageUrl || '').trim()
    return imageUrl && !pill.imageUrl ? { ...pill, imageUrl } : pill
  }

  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) =>
        toKitchenPill(entry.kitchen, {
          id: String((entry.kitchen as any)?.id || '').trim() || String((entry as any)?.id || '').trim(),
          imageUrl:
            String((entry.kitchen as any)?.image_url || '').trim() ||
            String((entry as any)?.image_url || '').trim(),
        })
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof kitchenInterface>> => Boolean(entry))
  )

  const activeKitchenPill = computed(() =>
    toKitchenPill(runtime.kitchen.value)
  )
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
    activeKitchenPill,
    showSelector,
    setActiveScenario,
  }
}
