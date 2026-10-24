import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
type Member = { id?: string; memberId?: string; name: string; avatar: string }
import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import { usePortfolioWorkspace } from './usePortfolioWorkspace'

export function usePortfolioWorkspaceHome() {
  const workspace = usePortfolioWorkspace()
  const { focus } = useOverview({
    entity: workspace.data,
    id: workspace.id,
    outcome: workspace.outcome,
  })
  const multiple = computed(() => ({
    items: workspace.collection.value,
    count: workspace.collection.value.length,
    hasItems: workspace.collection.value.length > 0,
    outcome: workspace.collectionOutcome.value,
  }))

  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `portfolio-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}-${workspace.outcome.value}`
  )
  const { data, status, error } = useLiveAsyncData(
    key,
    async (liveFetch) => {
      const id = workspace.outcome.value === 'ready' ? workspace.id.value : ''
      const user = currentUser.value
      if (!id || !user) return null
      return liveFetch<{ portfolioId: string; members: Member[] }>(
        '/api/workspace/portfolio/team/members',
        {
          query: { portfolioId: id },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false }
  )
  const team = {
    members: computed(() =>
      workspace.outcome.value === 'ready' &&
      !error.value &&
      status.value === 'success' &&
      data.value &&
      data.value.portfolioId === workspace.id.value
        ? data.value.members
        : []
    ),
    pending: computed(
      () => status.value === 'pending' || status.value === 'idle'
    ),
    error,
  }
  return {
    team,
    focus,
    multiple,
    outcome: workspace.outcome,
    selectedPortfolio: workspace.data,
    portfolioId: workspace.id,
  }
}
