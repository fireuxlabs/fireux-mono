import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import type { ProjectSurface } from './useProjectInterface'
import {
  useProjectCollection,
  type UseProjectCollectionReturn,
} from './useProjectCollection'

export type ProjectDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

export type UseProjectDetailReturn = Pick<
  UseProjectCollectionReturn,
  'pending' | 'error' | 'refresh'
> & {
  project: ComputedRef<ProjectSurface | null>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<ProjectDetailOutcome>
}

export function useProjectDetail(
  id: string | Ref<string>
): UseProjectDetailReturn {
  const projectId = computed(() => String(isRef(id) ? id.value : id).trim())
  const collection = useProjectCollection({
    filter: computed(() => ({ ids: projectId.value ? [projectId.value] : [] })),
  })
  const project = computed(() => collection.projects.value[0] ?? null)
  const missing = computed(
    () => !collection.pending.value && !collection.error.value && !project.value
  )
  const failed = computed(() => Boolean(collection.error.value))
  const statusCode = computed(() =>
    failed.value ? 503 : missing.value ? 404 : project.value ? 200 : 0
  )
  const outcome = computed<ProjectDetailOutcome>(() => {
    if (collection.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    project,
    pending: collection.pending,
    error: collection.error,
    refresh: collection.refresh,
    statusCode,
    missing,
    failed,
    outcome,
  }
}
