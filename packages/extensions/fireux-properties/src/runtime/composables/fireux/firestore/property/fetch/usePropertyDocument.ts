import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useRuntimePortfolio } from '../../../app/portfolio-runtime/useRuntimePortfolio'
import type { Property } from '../../../../../models/property.model'

const normalizeId = (value: unknown) => String(value || '').trim()

export function usePropertyDocument(
  propertyId: string | (() => string),
  runtimePortfolio = useRuntimePortfolio()
) {
  const { firestoreFetchDoc } = useFirestoreRead()

  const normalizedPropertyId = computed(() =>
    typeof propertyId === 'function' ? normalizeId(propertyId()) : normalizeId(propertyId)
  )

  const liveDoc = computed(() => {
    const portfolioId = normalizeId(runtimePortfolio.id.value)
    const id = normalizedPropertyId.value
    if (!portfolioId || !id || runtimePortfolio.isReadOnly.value) return null
    return firestoreFetchDoc<Property>(`portfolios/${portfolioId}/properties`, id)
  })

  const document = computed<Property | null>(() => {
    if (!normalizedPropertyId.value) return null

    if (runtimePortfolio.isReadOnly.value) {
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
    document,
  }
}
