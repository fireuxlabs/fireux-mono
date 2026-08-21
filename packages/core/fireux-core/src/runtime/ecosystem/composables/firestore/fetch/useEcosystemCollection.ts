import { useAsyncData } from '#imports'
import { computed, unref, type MaybeRef } from 'vue'
import {
  EcosystemStorage,
  type Ecosystem,
} from '../../../models/ecosystem.model.ts'
import { useFirestoreCollectionState } from '../../../../composables/fireux/firestore/operations/useFirestoreCollection'

type EcosystemCollectionDoc = Ecosystem
const DEFAULT_COLLECTION_PATH = EcosystemStorage.collection

export function useEcosystemCollection(
  collectionPath: MaybeRef<string | null | undefined> = DEFAULT_COLLECTION_PATH
) {
  const path = computed(() => String(unref(collectionPath) ?? '').trim())
  const source = useAsyncData<EcosystemCollectionDoc[]>(
    'ecosystem-collection',
    () =>
      path.value === DEFAULT_COLLECTION_PATH
        ? $fetch<EcosystemCollectionDoc[]>('/api/ecosystems')
        : Promise.resolve([]),
    { watch: [path] }
  )
  const ecosystems = computed(() => source.data.value ?? [])
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
