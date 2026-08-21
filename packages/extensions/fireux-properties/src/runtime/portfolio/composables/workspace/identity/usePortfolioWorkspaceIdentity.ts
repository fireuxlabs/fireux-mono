// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Portfolio: expose canonical root identity without the scoped runtime write alias.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { PortfolioStorage } from '../../../models/portfolio.model.ts'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'

export function usePortfolioWorkspaceIdentity() {
  const { selection, runtime, actions } = usePortfolioWorkspace()

  const name = computed(() => normalizeString(selection.portfolio.value?.name))
  const tagline = computed(() =>
    normalizeString(selection.portfolio.value?.tagline)
  )
  const imageUrl = computed(() =>
    normalizeString(selection.portfolio.value?.image_url)
  )
  const notes = computed(() =>
    normalizeString(selection.portfolio.value?.notes)
  )
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
    rootCollection: PortfolioStorage.rootCollection,
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

export type PortfolioWorkspaceIdentityState = ReturnType<
  typeof usePortfolioWorkspaceIdentity
>
