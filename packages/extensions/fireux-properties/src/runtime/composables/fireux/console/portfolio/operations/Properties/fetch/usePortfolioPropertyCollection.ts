// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Property: resolve Portfolio membership from canonical Property.portfolio_id.
import {
  collection,
  query,
  where,
  type Query,
} from 'firebase/firestore'
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useActivePortfolio } from '../../useActivePortfolio'
import { PropertyStorage, type Property } from '../../../../../../../models/property.model'
import { canonicalPropertyRoot } from '../../../../../firestore/property/utils/view/usePropertyInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioPropertyCollection(
  runtimePortfolio = useActivePortfolio()
) {
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()
  const portfolioId = computed(() => normalizeString(runtimePortfolio.id.value))
  const collectionPath = computed(() =>
    runtimePortfolio.source.value === 'live' && portfolioId.value
      ? PropertyStorage.rootCollection
      : ''
  )
  const propertyQuery = computed<Query<Property> | null>(() => {
    if (!collectionPath.value) return null
    return query(
      collection(db, PropertyStorage.rootCollection),
      where('portfolio_id', '==', portfolioId.value)
    ) as Query<Property>
  })
  const source = firestoreQuery<Property>(
    propertyQuery,
    undefined,
    collectionPath
  )
  const properties = computed<Property[]>(() =>
    (source.value ?? []).reduce<Property[]>((items, property) => {
      const root = canonicalPropertyRoot(property)
      if (root) items.push(root)
      return items
    }, [])
  )

  return {
    portfolioId,
    collectionPath,
    collection: properties,
    count: computed(() => properties.value.length),
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
