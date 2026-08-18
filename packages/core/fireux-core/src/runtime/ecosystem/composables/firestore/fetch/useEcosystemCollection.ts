import { computed, unref, type MaybeRef } from 'vue'
import {
  EcosystemStorage,
  type Ecosystem,
} from '../../../models/ecosystem.model.ts'
import { useFirestoreCollectionState } from '../../../../composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from '../../../../composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../../../composables/fireux/firestore/vuefire'

type EcosystemCollectionDoc = Ecosystem
const DEFAULT_COLLECTION_PATH = EcosystemStorage.collection

export function useEcosystemCollection(
  collectionPath: MaybeRef<string | null | undefined> = DEFAULT_COLLECTION_PATH
) {
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const path = computed(() => String(unref(collectionPath) ?? '').trim())
  const source = firestoreFetchCollection<EcosystemCollectionDoc>(path)
  const ecosystems = computed(() => source.value ?? [])
  const count = computed(() => ecosystems.value.length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const active = computed(() => Boolean(path.value))
  const { outcome } = useFirestoreCollectionState({
    active,
    count,
    error,
    pending,
  })

  return { ecosystems, count, pending, error, outcome }
}
