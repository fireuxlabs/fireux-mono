import { computed } from 'vue'
import { EcosystemStorage } from '../../../../../../models/system/ecosystem.model'
import type { EcosystemSurface } from '../utils/view/useEcosystemInterface'
import { useFirestoreCollectionState } from '../../../operations/useFirestoreCollection'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type EcosystemCollectionDoc = EcosystemSurface
const DEFAULT_COLLECTION_PATH = EcosystemStorage.collection

export function useEcosystemCollection(
  collectionPath: string | { value?: string } = DEFAULT_COLLECTION_PATH
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path = computed(() => {
    const value = typeof collectionPath === 'string'
      ? collectionPath
      : collectionPath?.value
    return String(value || DEFAULT_COLLECTION_PATH).trim() || DEFAULT_COLLECTION_PATH
  })
  const source = firestoreFetchCollection<EcosystemCollectionDoc>(path)
  const ecosystems = computed(() => source.value ?? [])
  const count = computed(() => ecosystems.value.length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return { ecosystems, count, pending, error, outcome }
}
