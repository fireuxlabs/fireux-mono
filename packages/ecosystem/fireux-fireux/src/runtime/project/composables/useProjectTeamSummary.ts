import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectWorkspace } from './workspace/useProjectWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function useProjectTeamSummary() {
  const workspace = useProjectWorkspace()
  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `project-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`
  )
  const { data, status, error } = useLiveAsyncData(
    key,
    async (liveFetch) => {
      const id = workspace.id.value
      const user = currentUser.value
      if (!id || !user) return null
      return liveFetch<{ project_id: string; members: Member[] }>(
        `/api/internal/control/projects/${encodeURIComponent(id)}/team`,
        {
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false }
  )
  return {
    members: computed(() =>
      data.value && data.value.project_id === workspace.id.value
        ? data.value.members
        : []
    ),
    pending: computed(
      () => status.value === 'pending' || status.value === 'idle'
    ),
    error,
  }
}
