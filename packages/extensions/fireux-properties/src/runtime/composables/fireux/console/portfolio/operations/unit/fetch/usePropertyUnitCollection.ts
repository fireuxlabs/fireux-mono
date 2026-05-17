import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import type { Unit } from '../../../../../../../models/unit.model'

const normalizeId = (value: unknown) => String(value || '').trim()

export function usePropertyUnitCollection(
  propertyId: string | (() => string),
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<Unit[] | undefined> | null>
  const propertiesPath = usePortfolioConsoleChildPath(runtimePortfolio, 'properties')

  const normalizedPropertyId = computed(() =>
    typeof propertyId === 'function' ? normalizeId(propertyId()) : normalizeId(propertyId)
  )

  watch(
    [propertiesPath, normalizedPropertyId],
    ([nextPropertiesPath, nextPropertyId]) => {
      if (!nextPropertiesPath || !nextPropertyId || runtimePortfolio.isDemo.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Unit>(`${nextPropertiesPath}/${nextPropertyId}/units`)
    },
    { immediate: true }
  )

  const collection = computed<Unit[]>(() => {
    if (!normalizedPropertyId.value) return []

    if (runtimePortfolio.isDemo.value) {
      return (runtimePortfolio.scenario.value?.units ?? []).filter(
        (entry) => normalizeId(entry.property_id) === normalizedPropertyId.value
      )
    }

    return sourceRef.value?.value ?? []
  })

  return {
    propertyId: normalizedPropertyId,
    collectionPath: computed(() =>
      propertiesPath.value && normalizedPropertyId.value
        ? `${propertiesPath.value}/${normalizedPropertyId.value}/units`
        : ''
    ),
    collection,
  }
}
