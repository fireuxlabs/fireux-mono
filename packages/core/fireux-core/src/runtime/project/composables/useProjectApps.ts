import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import type { App } from '../../app/models/app.model'
import { useProjectWorkspace } from './workspace/core/useProjectWorkspace'

type ProjectAppsResponse = { ok: true; project_id: string; items: App[] }

export function useProjectApps() {
  const workspace = useProjectWorkspace()
  const { currentUser, hasAuthState } = useAuth()
  const projectId = computed(() => String(workspace.id.value ?? '').trim())
  const key = computed(() => `project-apps:${currentUser.value?.uid ?? ''}:${projectId.value}`)
  const state = useAsyncData<ProjectAppsResponse>(key, async () => {
    const id = projectId.value
    const user = currentUser.value
    if (!id || !user) return { ok: true, project_id: id, items: [] }
    const response = await $fetch<ProjectAppsResponse>(`/api/internal/control/projects/${encodeURIComponent(id)}/apps`, {
      headers: { authorization: `Bearer ${await user.getIdToken()}` },
    })
    if (response.ok !== true || response.project_id !== id || !Array.isArray(response.items)) throw new Error('Invalid Project Apps response.')
    return response
  }, { server: false })
  const apps = computed(() => state.data.value?.project_id === projectId.value ? state.data.value.items : [])
  const count = computed(() => apps.value.length)
  const pending = computed(() => !hasAuthState.value || workspace.outcome.value === 'pending' || state.pending.value)
  const error = state.error
  const outcome = computed(() => {
    if (pending.value) return 'pending' as const
    if (!projectId.value) return 'idle' as const
    if (error.value) return 'error' as const
    return count.value ? 'ready' as const : 'empty' as const
  })
  return { selectedProject: workspace.data, projectId, apps, count, pending, error, outcome, refresh: state.refresh }
}
