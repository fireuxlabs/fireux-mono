import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { usePortfolioConsole } from '../core/usePortfolioConsole'

export function usePortfolioConsoleIdentity() {
  const {
    selection,
    runtime,
    actions,
  } = usePortfolioConsole()

  const name = computed(() => normalizeString(selection.portfolio.value?.name))
  const tagline = computed(() =>
    normalizeString(selection.portfolio.value?.tagline)
  )
  const imageUrl = computed(() =>
    normalizeString(selection.portfolio.value?.image_url)
  )
  const notes = computed(() => normalizeString(selection.portfolio.value?.notes))
  const ownerLabel = computed(() =>
    normalizeString(selection.portfolio.value?.owner_label)
  )
  const strategyLabel = computed(() =>
    normalizeString(selection.portfolio.value?.strategy_label)
  )
  const regionLabel = computed(() =>
    normalizeString(selection.portfolio.value?.region_label)
  )
  const debug = computed(() => ({
    portfolioId: selection.portfolioId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    name: name.value,
    tagline: tagline.value,
    imageUrl: imageUrl.value,
    notes: notes.value,
    ownerLabel: ownerLabel.value,
    strategyLabel: strategyLabel.value,
    regionLabel: regionLabel.value,
    selectedPortfolio: selection.portfolio.value,
  }))

  return {
    selectedPortfolio: selection.portfolio,
    portfolioId: selection.portfolioId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedPortfolio: actions.clearSelectedPortfolio,
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
