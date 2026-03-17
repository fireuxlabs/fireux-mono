import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useRuntimePortfolio } from '../../../app/portfolio-runtime/useRuntimePortfolio'
import type { Unit } from '../../../../../models/unit.model'

const normalizeId = (value: unknown) => String(value || '').trim()

export function usePropertyUnitCollection(
  propertyId: string | (() => string),
  runtimePortfolio = useRuntimePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Unit[] | undefined> | null>

  const normalizedPropertyId = computed(() =>
    typeof propertyId === 'function' ? normalizeId(propertyId()) : normalizeId(propertyId)
  )

  watch(
    [runtimePortfolio.id, runtimePortfolio.mode, normalizedPropertyId],
    ([portfolioId, mode, nextPropertyId]) => {
      if (!portfolioId || !nextPropertyId || mode === 'read-only') {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Unit>(
        `portfolios/${portfolioId}/properties/${nextPropertyId}/units`
      )
    },
    { immediate: true }
  )

  const collection = computed<Unit[]>(() => {
    if (!normalizedPropertyId.value) return []

    if (runtimePortfolio.isReadOnly.value) {
      return (runtimePortfolio.scenario.value?.units ?? []).filter(
        (entry) => normalizeId(entry.property_id) === normalizedPropertyId.value
      )
    }

    return sourceRef.value?.value ?? []
  })

  return {
    propertyId: normalizedPropertyId,
    collection,
  }
}