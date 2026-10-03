import { usePortfolioAccess } from './usePortfolioAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useIdentity } from 'fireux-core/runtime/composables/fireux/useIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { PortfolioStorage } from '../models/portfolio.model.ts'
import { usePortfolioWorkspace } from './workspace/usePortfolioWorkspace'

export function usePortfolioIdentity() {
  const workspace = usePortfolioWorkspace()
  const access = usePortfolioAccess()
  const { currentUser } = useAuth()

  const name = computed(() => normalizeString(workspace.data.value?.name))
  const tagline = computed(() => normalizeString(workspace.data.value?.tagline))
  const imageUrl = computed(() =>
    normalizeString(workspace.data.value?.image_url)
  )
  const notes = computed(() => normalizeString(workspace.data.value?.notes))
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

  const fields = computed(() => ({
    name: name.value,
    tagline: tagline.value,
    imageUrl: imageUrl.value,
    notes: notes.value,
    ownerLabel: ownerLabel.value,
    strategyLabel: strategyLabel.value,
    regionLabel: regionLabel.value,
  }))
  const state = useIdentity({
    id: workspace.id,
    fields,
    status: workspace.outcome,
    canWrite: computed(() =>
      Boolean(
        currentUser.value &&
          access.outcome.value === 'ready' &&
          access.ids.value.includes(workspace.id.value) &&
          workspace.data.value?.id === workspace.id.value
      )
    ),
  })

  return {
    ...state,
    fields,
    selectedPortfolio: workspace.data,
    portfolioId: workspace.id,
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

export type PortfolioIdentityState = ReturnType<typeof usePortfolioIdentity>
