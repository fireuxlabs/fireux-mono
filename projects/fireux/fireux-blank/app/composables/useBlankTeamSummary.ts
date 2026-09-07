import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useBlankWorkspace } from './fireux/workspace/blank/core/useBlankWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function useBlankTeamSummary() {
  const workspace = useBlankWorkspace()
  const { currentUser } = useAuth()
  const key = computed(() => `blank-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`)
  const { data, status, error } = useAsyncData(key, async () => {
    const id = workspace.id.value
    const user = currentUser.value
    if (!id || !user) return null
    return $fetch<{ blankId: string; members: Member[] }>('/api/workspace/blank/team/members', {
      query: { blankId: id },
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
    })
  }, { server: false })
  return {
    members: computed(() => data.value?.blankId === workspace.id.value ? data.value.members : []),
    pending: computed(() => status.value === 'pending' || status.value === 'idle'),
    error,
  }
}
