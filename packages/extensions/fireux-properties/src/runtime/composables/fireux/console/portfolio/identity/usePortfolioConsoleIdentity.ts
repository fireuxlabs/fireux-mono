import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { usePortfolioConsole } from '../core/usePortfolioConsole'

export function usePortfolioConsoleIdentity() {
  const {
    selectedPortfolio,
    portfolioId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
  } = usePortfolioConsole()

  const name = computed(() => normalizeString(selectedPortfolio.value?.name))
  const tagline = computed(() =>
    normalizeString(selectedPortfolio.value?.tagline)
  )
  const imageUrl = computed(() =>
    normalizeString(selectedPortfolio.value?.image_url)
  )
  const notes = computed(() => normalizeString(selectedPortfolio.value?.notes))
  const ownerLabel = computed(() =>
    normalizeString(selectedPortfolio.value?.owner_label)
  )
  const strategyLabel = computed(() =>
    normalizeString(selectedPortfolio.value?.strategy_label)
  )
  const regionLabel = computed(() =>
    normalizeString(selectedPortfolio.value?.region_label)
  )
  const debug = computed(() => ({
    portfolioId: portfolioId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    tagline: tagline.value,
    imageUrl: imageUrl.value,
    notes: notes.value,
    ownerLabel: ownerLabel.value,
    strategyLabel: strategyLabel.value,
    regionLabel: regionLabel.value,
    selectedPortfolio: selectedPortfolio.value,
  }))

  return {
    selectedPortfolio,
    portfolioId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
    name,
    tagline,
    imageUrl,
    notes,
    ownerLabel,
    strategyLabel,
    regionLabel,
    debug,
  }
}

export type PortfolioConsoleIdentityState = ReturnType<
  typeof usePortfolioConsoleIdentity
>
