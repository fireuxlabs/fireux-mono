import { computed, isRef, type Ref } from 'vue'
import { useProjectCollection } from './useProjectCollection'

export function useProjectDetail(id: string | Ref<string>) {
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
  const outcome = computed(() => {
    if (collection.pending.value) return 'pending' as const
    if (failed.value) return 'error' as const
    if (missing.value) return 'missing' as const
    return 'ready' as const
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
