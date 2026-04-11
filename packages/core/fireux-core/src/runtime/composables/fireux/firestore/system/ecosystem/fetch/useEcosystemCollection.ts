import { computed } from 'vue'
import type { EcosystemSurface } from '../utils/view/useEcosystemInterface'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type EcosystemCollectionDoc = EcosystemSurface

export function useEcosystemCollection(collectionPath: string | { value?: string } = 'ecosystems') {
  const { firestoreFetchCollection } = useFirestoreRead()
  const path =
    typeof collectionPath === 'string'
      ? collectionPath
      : String(collectionPath?.value || 'ecosystems').trim() || 'ecosystems'
  const source = firestoreFetchCollection<EcosystemCollectionDoc>(path)
  const ecosystems = computed(() => source.value ?? [])
  const count = computed(() => ecosystems.value.length)

  return { ecosystems, count }
}
