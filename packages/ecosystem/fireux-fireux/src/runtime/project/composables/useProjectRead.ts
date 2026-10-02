import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Project } from '../models/project.model'

/** Live client read for one root Project document. */
export function useProjectRead(id: MaybeRef<string | null | undefined>) {
  const projectId = computed(() => String(unref(id) || '').trim())
  const { firestoreFetchDoc } = useFirestoreRead()
  const source = firestoreFetchDoc<Project>('projects', projectId)

  return {
    data: computed(() => source.value ?? null),
    outcome: source.outcome,
    pending: source.pending,
    error: source.error,
  }
}
