import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function useKitchenTeamSummary() {
  const workspace = useKitchenWorkspace()
  const { currentUser } = useAuth()
  const key = computed(() => `kitchen-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`)
  const { data, status, error } = useAsyncData(key, async () => {
    const id = workspace.id.value
    const user = currentUser.value
    if (!id || !user) return null
    return $fetch<{ kitchenId: string; members: Member[] }>('/api/workspace/kitchen/team/members', {
      query: { kitchenId: id },
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
    })
  }, { server: false })
  return {
    members: computed(() => data.value?.kitchenId === workspace.id.value ? data.value.members : []),
    pending: computed(() => status.value === 'pending' || status.value === 'idle'),
    error,
  }
}
