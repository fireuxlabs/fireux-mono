import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useProjectWorkspace } from './workspace/core/useProjectWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function useProjectTeamSummary() {
  const workspace = useProjectWorkspace()
  const { currentUser } = useAuth()
  const key = computed(() => `project-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`)
  const { data, status, error } = useAsyncData(key, async () => {
    const id = workspace.id.value
    const user = currentUser.value
    if (!id || !user) return null
    return $fetch<{ project_id: string; members: Member[] }>(`/api/internal/control/projects/${encodeURIComponent(id)}/team`, {
      
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
    })
  }, { server: false })
  return {
    members: computed(() => data.value?.project_id === workspace.id.value ? data.value.members : []),
    pending: computed(() => status.value === 'pending' || status.value === 'idle'),
    error,
  }
}
