import { computed, isRef, ref, watch, type ComputedRef, type Ref } from 'vue'
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
  const projectValue = ref<Project | null>(null)
  const pendingValue = ref(false)
  const errorValue = ref<unknown>()
  let requestSequence = 0

  async function load() {
    const user = currentUser.value
    const requestedId = projectId.value
    if (!import.meta.client || !hasAuthState.value || !user || !requestedId) {
      projectValue.value = null
      pendingValue.value = false
      errorValue.value = undefined
      return
    }

    const sequence = ++requestSequence
    pendingValue.value = true
    errorValue.value = undefined
    try {
      const response = await $fetch<ProjectDetailResponse>(
        '/api/internal/control/projects',
        {
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
          query: { project_id: requestedId },
        }
      )
      if (sequence !== requestSequence) return
      projectValue.value =
        response.items.find((project) => project.id === requestedId) ?? null
    } catch (cause) {
      if (sequence !== requestSequence) return
      projectValue.value = null
      errorValue.value = cause
    } finally {
      if (sequence === requestSequence) pendingValue.value = false
    }
  }

  watch([currentUser, hasAuthState, projectId], () => void load(), {
    immediate: true,
  })

  const project = computed(() => projectValue.value)
  const pending = computed(() => pendingValue.value)
  const error = computed(() => errorValue.value)
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
    refresh: load,
    statusCode,
    missing,
    failed,
    outcome,
  }
}
