import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from '../../../app/portfolio-runtime/useRuntimePortfolio'
import type { Property } from '../../../../../models/property.model'

export function usePortfolioPropertyCollection(runtimePortfolio = useRuntimePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Property[] | undefined> | null>
  const collectionPath = useRuntimePortfolioPath(runtimePortfolio, 'properties')

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isReadOnly.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Property>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Property[]>(() => {
    if (runtimePortfolio.isReadOnly.value) {
      return runtimePortfolio.scenario.value?.properties ?? []
    }
    return sourceRef.value?.value ?? []
  })

  return {
    collectionPath,
    collection,
  }
}
