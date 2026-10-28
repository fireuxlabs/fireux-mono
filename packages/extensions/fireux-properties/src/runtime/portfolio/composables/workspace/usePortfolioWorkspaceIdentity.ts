import { usePortfolioAccess } from '../usePortfolioAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceIdentity } from 'fireux-core/runtime/workspace/composables/useWorkspaceIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/normalize-string'
import { PortfolioStorage } from '../../models/portfolio.model.ts'
import { usePortfolioWorkspace } from './usePortfolioWorkspace'

export function usePortfolioWorkspaceIdentity() {
  const workspace = usePortfolioWorkspace()
  const access = usePortfolioAccess()
  const { currentUser } = useAuth()

  const name = computed(() =>
    normalizeString(workspace.data.value?.identity?.name)
  )
  const tagline = computed(() =>
    normalizeString(workspace.data.value?.identity?.tagline)
  )
  const imageUrl = computed(() =>
    normalizeString(workspace.data.value?.identity?.image_url)
  )
  const notes = computed(() =>
    normalizeString(workspace.data.value?.identity?.notes)
  )
  const ownerLabel = computed(() =>
    normalizeString(workspace.data.value?.identity?.owner_label)
  )
  const strategyLabel = computed(() =>
    normalizeString(workspace.data.value?.identity?.strategy_label)
  )
  const regionLabel = computed(() =>
    normalizeString(workspace.data.value?.identity?.region_label)
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
  const state = useWorkspaceIdentity({
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

export type PortfolioWorkspaceIdentityState = ReturnType<
  typeof usePortfolioWorkspaceIdentity
>
