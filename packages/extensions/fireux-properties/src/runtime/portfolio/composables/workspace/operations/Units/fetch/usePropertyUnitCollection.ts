import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from '../../useActivePortfolio'
import {
  UnitStorage,
  type Unit,
} from '../../../../../../property/models/unit.model.ts'

const normalizeId = (value: unknown) => String(value || '').trim()

export function usePropertyUnitCollection(
  propertyId: string | (() => string),
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<
    Unit[] | undefined
  > | null>
  const unitsPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    UnitStorage.collection
  )

  const normalizedPropertyId = computed(() =>
    typeof propertyId === 'function'
      ? normalizeId(propertyId())
      : normalizeId(propertyId)
  )

  watch(
    [unitsPath, normalizedPropertyId],
    ([nextUnitsPath, nextPropertyId]) => {
      if (!nextUnitsPath || !nextPropertyId) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Unit>(nextUnitsPath)
    },
    { immediate: true }
  )

  const collection = computed<Unit[]>(() => {
    if (!normalizedPropertyId.value) return []
    return (sourceRef.value?.value ?? []).filter(
      (entry) => normalizeId(entry.property_id) === normalizedPropertyId.value
    )
  })
  const { byId: unit } = useCollectionById(collection)

  return {
    propertyId: normalizedPropertyId,
    collectionPath: computed(() =>
      normalizedPropertyId.value ? unitsPath.value : ''
    ),
    collection,
    unit,
  }
}
