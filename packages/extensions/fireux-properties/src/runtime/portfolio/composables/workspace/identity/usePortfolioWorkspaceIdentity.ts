import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { PortfolioStorage } from '../../../models/portfolio.model.ts'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'
import { usePortfolioWorkspaceIndex } from '../index/usePortfolioWorkspaceIndex'

export function usePortfolioWorkspaceIdentity() {
  const workspace = usePortfolioWorkspace()
  const index = usePortfolioWorkspaceIndex()

  const name = computed(() => normalizeString(workspace.data.value?.name))
  const tagline = computed(() =>
    normalizeString(workspace.data.value?.tagline)
  )
  const imageUrl = computed(() =>
    normalizeString(workspace.data.value?.image_url)
  )
  const notes = computed(() =>
    normalizeString(workspace.data.value?.notes)
  )
  const ownerLabel = computed(() =>
    normalizeString(workspace.data.value?.owner_label)
  )
  const strategyLabel = computed(() =>
    normalizeString(workspace.data.value?.strategy_label)
  )
  const regionLabel = computed(() =>
    normalizeString(workspace.data.value?.region_label)
  )
  const debug = computed(() => ({
    portfolioId: workspace.id.value,
    rootCollection: PortfolioStorage.rootCollection,
    name: name.value,
    tagline: tagline.value,
    imageUrl: imageUrl.value,
    notes: notes.value,
    ownerLabel: ownerLabel.value,
    strategyLabel: strategyLabel.value,
    regionLabel: regionLabel.value,
    selectedPortfolio: workspace.data.value,
  }))

  return {
    selectedPortfolio: workspace.data,
    portfolioId: workspace.id,
    clearSelectedPortfolio: index.clear,
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
