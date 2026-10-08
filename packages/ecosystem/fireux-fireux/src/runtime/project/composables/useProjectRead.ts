import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { readProjectDocument } from '../utils/readProject'

/** Live canonical read; malformed settled data is a failure, never missing. */
export function useProjectRead(id: MaybeRef<string | null | undefined>) {
  const projectId = computed(() => String(unref(id) || '').trim())
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<Record<string, unknown>>('projects', projectId)
  const parsed = computed(() =>
    projectId.value && source.outcome.value === 'ready' && source.value?.id === projectId.value
      ? readProjectDocument(source.value, projectId.value) : null
  )
  const error = computed(() => !projectId.value ? undefined : source.error.value ?? (
    projectId.value && source.outcome.value === 'ready' && source.value && !parsed.value
      ? new Error('Project source is invalid.') : undefined
  ))
  const outcome = computed(() => source.outcome.value === 'pending' ? 'pending' : error.value ? 'error' : source.outcome.value)
  return {
    data: computed(() => outcome.value === 'ready' ? parsed.value : null),
    outcome, pending: computed(() => outcome.value === 'pending'), error,
  }
}
