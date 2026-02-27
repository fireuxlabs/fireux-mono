import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useRuntimePortfolio } from '../../../app/portfolio-runtime/useRuntimePortfolio'
import type { Property } from '../../../../../models/property.model'

export function usePropertyCollection(runtimePortfolio = useRuntimePortfolio()) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Property[] | undefined> | null>

  watch(
    [runtimePortfolio.id, runtimePortfolio.mode],
    ([nextId, nextMode]) => {
      if (!nextId || nextMode === 'read-only') {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Property>(`portfolios/${nextId}/properties`)
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
    collection,
  }
}
