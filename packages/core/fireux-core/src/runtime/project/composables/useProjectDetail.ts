import { useLiveAsyncData } from '../../composables/fireux/firestore/useLiveAsyncData'
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import type { Project } from '../models/project.model'

type ProjectDetailResponse = {
  ok: true
  items: Project[]
}

export type UseProjectDetailReturn = {
  project: ComputedRef<Project | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refresh: () => Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<'pending' | 'error' | 'missing' | 'ready'>
}

export function useProjectDetail(
  id: string | Ref<string>
): UseProjectDetailReturn {
  const { currentUser, hasAuthState } = useAuth()
  const projectId = computed(() => String(isRef(id) ? id.value : id).trim())
  const state = useLiveAsyncData<ProjectDetailResponse>(
    computed(
      () => `project-detail:${currentUser.value?.uid || ''}:${projectId.value}`
    ),
    async (liveFetch) => {
      const user = currentUser.value
      if (!hasAuthState.value || !user || !projectId.value)
        return { ok: true, items: [] }
      return liveFetch<ProjectDetailResponse>(
        '/api/internal/control/projects',
        {
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
          query: { project_id: projectId.value },
        }
      )
    },
    { server: false, watch: [hasAuthState] }
  )
  const project = computed(
    () =>
      state.data.value?.items.find((item) => item.id === projectId.value) ||
      null
  )
  const pending = computed(() => state.pending.value)
  const error = computed(() => state.error.value || undefined)
  const missing = computed(
    () => !pending.value && !error.value && !project.value
  )
  const failed = computed(() => Boolean(error.value))
  const statusCode = computed(() =>
    failed.value ? 503 : missing.value ? 404 : project.value ? 200 : 0
  )
  const outcome = computed(() => {
    if (pending.value) return 'pending' as const
    if (failed.value) return 'error' as const
    if (missing.value) return 'missing' as const
    return 'ready' as const
  })

  return {
    project,
    pending,
    error,
    refresh: async () => {
      await state.refresh()
    },
    statusCode,
    missing,
    failed,
    outcome,
  }
}
