import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { usePortfolioConsole } from './usePortfolioConsole'

export function usePortfolioConsoleIdentity() {
  const {
    selectedPortfolio,
    selectedMode,
    portfolioId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
  } = usePortfolioConsole()

  const name = computed(() => normalizeString(selectedPortfolio.value?.name))
  const notes = computed(() => normalizeString(selectedPortfolio.value?.notes))
  const ownerLabel = computed(() =>
    normalizeString(selectedPortfolio.value?.owner_label)
  )
  const debug = computed(() => ({
    mode: selectedMode.value,
    portfolioId: portfolioId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    notes: notes.value,
    ownerLabel: ownerLabel.value,
    selectedPortfolio: selectedPortfolio.value,
  }))

  return {
    selectedPortfolio,
    selectedMode,
    portfolioId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
    name,
    notes,
    ownerLabel,
    debug,
  }
}

export type PortfolioConsoleIdentityState = ReturnType<
  typeof usePortfolioConsoleIdentity
>
