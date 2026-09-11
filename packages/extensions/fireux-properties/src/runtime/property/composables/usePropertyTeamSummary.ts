import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePropertyWorkspace } from './workspace/core/usePropertyWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function usePropertyTeamSummary() {
  const workspace = usePropertyWorkspace()
  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `property-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`
  )
  const { data, status, error } = useLiveAsyncData(
    key,
    async (liveFetch) => {
      const id = workspace.id.value
      const user = currentUser.value
      if (!id || !user) return null
      return liveFetch<{ propertyId: string; members: Member[] }>(
        '/api/workspace/property/team/members',
        {
          query: { propertyId: id },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false }
  )
  return {
    members: computed(() =>
      data.value && data.value.propertyId === workspace.id.value
        ? data.value.members
        : []
    ),
    pending: computed(
      () => status.value === 'pending' || status.value === 'idle'
    ),
    error,
  }
}
