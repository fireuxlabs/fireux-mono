import { computed, unref, type MaybeRef } from 'vue'
import type { Ecosystem } from '../models/ecosystem.model.ts'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'

export function useEcosystemCollection(
  collectionPath: MaybeRef<string | null | undefined> = 'ecosystems'
) {
  const path = computed(() => String(unref(collectionPath) ?? '').trim())
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const source = firestoreFetchCollection<Ecosystem>(path)
  const ecosystems = computed(() => source.value ?? [])
  const count = computed(() => ecosystems.value.length)
  const pending = source.pending
  const error = source.error
  return {
    ecosystems,
    count,
    pending,
    error,
    outcome: source.outcome,
  }
}
