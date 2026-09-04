import { computed, unref, type MaybeRef } from 'vue'
import type { Ecosystem } from '../../../models/ecosystem.model.ts'
import { useFirestoreCollectionState } from '../../../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from '../../../../composables/fireux/firestore/operations/useFirestoreRead'

export function useEcosystemCollection(
  collectionPath: MaybeRef<string | null | undefined> = 'ecosystems'
) {
  const path = computed(() => String(unref(collectionPath) ?? '').trim())
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<Ecosystem>(path)
  const ecosystems = computed(() => source.value ?? [])
  const count = computed(() => ecosystems.value.length)
  const active = computed(() => Boolean(path.value))
  const { outcome } = useFirestoreCollectionState({
    active,
    count,
    error: source.error,
    pending: source.pending,
  })
  return {
    ecosystems,
    count,
    pending: source.pending,
    error: source.error,
    outcome,
  }
}
