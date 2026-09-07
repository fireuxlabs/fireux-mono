import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePortfolioWorkspace } from './workspace/core/usePortfolioWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function usePortfolioTeamSummary() {
  const workspace = usePortfolioWorkspace()
  const { currentUser } = useAuth()
  const key = computed(() => `portfolio-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`)
  const { data, status, error } = useAsyncData(key, async () => {
    const id = workspace.id.value
    const user = currentUser.value
    if (!id || !user) return null
    return $fetch<{ portfolioId: string; members: Member[] }>('/api/workspace/portfolio/team/members', {
      query: { portfolioId: id },
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
    })
  }, { server: false })
  return {
    members: computed(() => data.value?.portfolioId === workspace.id.value ? data.value.members : []),
    pending: computed(() => status.value === 'pending' || status.value === 'idle'),
    error,
  }
}
