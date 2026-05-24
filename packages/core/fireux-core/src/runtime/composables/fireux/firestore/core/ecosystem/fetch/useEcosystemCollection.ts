import { computed } from 'vue'
import type { EcosystemSurface } from '../utils/view/useEcosystemInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type EcosystemCollectionDoc = EcosystemSurface
const DEFAULT_COLLECTION_PATH = 'ecosystems'

export function useEcosystemCollection(
  collectionPath: string | { value?: string } = DEFAULT_COLLECTION_PATH
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path =
    typeof collectionPath === 'string'
      ? collectionPath
      : String(collectionPath?.value || DEFAULT_COLLECTION_PATH).trim() ||
        DEFAULT_COLLECTION_PATH
  const source = firestoreFetchCollection<EcosystemCollectionDoc>(path)
  const ecosystems = computed(() => source.value ?? [])
  const pending = computed(() => source.value === undefined)
  const count = computed(() => ecosystems.value.length)

  return { ecosystems, count, pending }
}
