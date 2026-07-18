import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import { PropertyStorage, type Property } from '../../../../../../../models/property.model'

const normalizeId = (value: unknown) => String(value || '').trim()

export function usePropertyDocument(
  propertyId: string | (() => string),
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const propertiesPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    PropertyStorage.overlayCollection
  )

  const normalizedPropertyId = computed(() =>
    typeof propertyId === 'function' ? normalizeId(propertyId()) : normalizeId(propertyId)
  )

  const liveDoc = firestoreFetchDoc<Property>(
    propertiesPath,
    normalizedPropertyId
  )

  const document = computed<Property | null>(() => {
    if (!normalizedPropertyId.value) return null
    return liveDoc.value ?? null
  })

  return {
    propertyId: normalizedPropertyId,
    collectionPath: propertiesPath,
    document,
    pending: liveDoc.pending,
    error: liveDoc.error,
    outcome: liveDoc.outcome,
  }
}
