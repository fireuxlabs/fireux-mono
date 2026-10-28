import { useAsyncData } from 'nuxt/app'

import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
type Member = { id?: string; memberId?: string; name: string; avatar: string }
import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Project target outcome into overview.
import { computed } from 'vue'
import { useProjectWorkspace } from './useProjectWorkspace'

export function useProjectWorkspaceHome() {
  const workspace = useProjectWorkspace()

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
      `project-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}-${workspace.outcome.value}`
  )
  const { data, status, error } = useAsyncData(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const id = workspace.outcome.value === 'ready' ? workspace.id.value : ''
      const user = currentUser.value
      if (!id || !user) return null
      return fetchRead<{ project_id: string; members: Member[] }>(
        `/api/internal/control/projects/${encodeURIComponent(id)}/team`,
        {
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
      data.value.project_id === workspace.id.value
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
    selectedProject: workspace.data,
    projectId: workspace.id,
  }
}
