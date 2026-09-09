import { computed, unref, type MaybeRef } from 'vue'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import type { Ecosystem } from '../models/ecosystem.model'

/** Live read of one Ecosystem through the shared Firestore reader. */
export function useEcosystemRead(id: MaybeRef<string | null | undefined>) {
  const targetId = computed(() => String(unref(id) ?? '').trim())
  const { firestoreFetchDoc } = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const source = firestoreFetchDoc<Ecosystem>('ecosystems', targetId)
  const ecosystem = computed<Ecosystem | null | undefined>(() => {
    if (!targetId.value || source.pending.value) return undefined
    return source.value ?? null
  })
  return {
    ecosystem,
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
