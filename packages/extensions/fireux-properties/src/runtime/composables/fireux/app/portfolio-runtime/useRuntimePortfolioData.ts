import { computed, type ComputedRef, type Ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'
import type { ReadOnlyPortfolioScenario } from './read-only-scenarios'

export function useRuntimePortfolioData(params: {
  id: Ref<string>
  pending: Ref<boolean> | ComputedRef<boolean>
  doc: Ref<Portfolio | null> | ComputedRef<Portfolio | null>
  scenario: Ref<ReadOnlyPortfolioScenario | null> | ComputedRef<ReadOnlyPortfolioScenario | null>
}) {
  const isLoading = computed(() => Boolean(params.pending.value))
  const isReady = computed(() => {
    if (!params.id.value) return false
    if (isLoading.value) return false
    return Boolean(params.doc.value)
  })

  const name = computed(() => String(params.doc.value?.name || '').trim())
  const shortName = computed(() => name.value)

  return {
    scenario: computed(() => params.scenario.value),
    isLoading,
    isReady,
    name,
    shortName,
  }
}
