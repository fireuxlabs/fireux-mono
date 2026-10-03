import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePortfolioWorkspace } from './workspace/usePortfolioWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function usePortfolioTeamSummary() {
  const workspace = usePortfolioWorkspace()
  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `portfolio-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`
  )
  const { data, status, error } = useLiveAsyncData(
    key,
    async (liveFetch) => {
      const id = workspace.id.value
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
  return {
    members: computed(() =>
      data.value && data.value.portfolioId === workspace.id.value
        ? data.value.members
        : []
    ),
    pending: computed(
      () => status.value === 'pending' || status.value === 'idle'
    ),
    error,
  }
}
