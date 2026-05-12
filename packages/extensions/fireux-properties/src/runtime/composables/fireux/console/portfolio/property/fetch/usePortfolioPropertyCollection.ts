import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../../../app/portfolio-console/useActivePortfolio'
import type { Property } from '../../../../../../models/property.model'

export function usePortfolioPropertyCollection(runtimePortfolio = useActivePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Property[] | undefined> | null>
  const collectionPath = usePortfolioConsoleChildPath(runtimePortfolio, 'properties')

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isDemo.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Property>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Property[]>(() => {
    if (runtimePortfolio.isDemo.value) {
      return runtimePortfolio.scenario.value?.properties ?? []
    }
    return sourceRef.value?.value ?? []
  })

  return {
    collectionPath,
    collection,
  }
}
