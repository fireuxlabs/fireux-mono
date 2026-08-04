import { computed, unref, type MaybeRef } from 'vue'
import { EcosystemStorage } from '../../../../../../models/core/ecosystem.model'
import type { EcosystemSurface } from '../utils/view/useEcosystemInterface'
import { useFirestoreCollectionState } from '../../../operations/useFirestoreCollection'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type EcosystemCollectionDoc = EcosystemSurface
const DEFAULT_COLLECTION_PATH = EcosystemStorage.collection

export function useEcosystemCollection(
  collectionPath: MaybeRef<string | null | undefined> = DEFAULT_COLLECTION_PATH
) {
  const { firestoreFetchCollection } = useFirestoreRead()
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
