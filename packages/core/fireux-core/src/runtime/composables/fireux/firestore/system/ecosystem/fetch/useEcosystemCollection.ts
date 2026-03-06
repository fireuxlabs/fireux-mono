import { computed } from 'vue'
import type { FireuxEcosystemRegistryDoc } from '../../../../../../models/system/ecosystem.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type EcosystemDoc = FireuxEcosystemRegistryDoc & { id?: string }

export function useEcosystemCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<EcosystemDoc>('ecosystems')
  const ecosystems = computed(() => source.value ?? [])
  const count = computed(() => ecosystems.value.length)

  return { ecosystems, count }
}
