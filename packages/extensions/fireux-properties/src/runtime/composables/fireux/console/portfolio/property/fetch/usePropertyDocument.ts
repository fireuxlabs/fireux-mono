import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../../../app/portfolio-console/useActivePortfolio'
import type { Property } from '../../../../../../models/property.model'

const normalizeId = (value: unknown) => String(value || '').trim()

export function usePropertyDocument(
  propertyId: string | (() => string),
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const propertiesPath = usePortfolioConsoleChildPath(runtimePortfolio, 'properties')

  const normalizedPropertyId = computed(() =>
    typeof propertyId === 'function' ? normalizeId(propertyId()) : normalizeId(propertyId)
  )

  const liveDoc = computed(() => {
    const id = normalizedPropertyId.value
    if (!propertiesPath.value || !id || runtimePortfolio.isDemo.value) return null
    return firestoreFetchDoc<Property>(propertiesPath.value, id)
  })

  const document = computed<Property | null>(() => {
    if (!normalizedPropertyId.value) return null

    if (runtimePortfolio.isDemo.value) {
      return (
        runtimePortfolio.scenario.value?.properties.find(
          (entry) => normalizeId(entry.id) === normalizedPropertyId.value
        ) ?? null
      )
    }

    return liveDoc.value?.value ?? null
  })

  return {
    propertyId: normalizedPropertyId,
    collectionPath: propertiesPath,
    document,
  }
}
