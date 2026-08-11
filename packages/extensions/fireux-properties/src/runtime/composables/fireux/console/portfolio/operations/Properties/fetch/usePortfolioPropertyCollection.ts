// Concurrent edit — 2026-07-20 23:03 CEST — Both-Entity Authority — Property: query only current-App roots after ready Portfolio access.
import { collection, query, where, type Query } from 'firebase/firestore'
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useActivePortfolio } from '../../useActivePortfolio'
import {
  PropertyStorage,
  type Property,
} from '../../../../../../../models/property.model'
import { canonicalPropertyRoot } from '../../../../../firestore/property/utils/view/usePropertyInterface'
import { propertyRootBelongsToApp } from '../../../../../firestore/property/fetch/property-collection-contract'

const normalizeString = (value: unknown) => String(value ?? '').trim()
export function usePortfolioPropertyCollection(
  runtimePortfolio = useActivePortfolio()
) {
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()
  const portfolioId = computed(() => normalizeString(runtimePortfolio.id.value))
  const consoleAppId = computed(() =>
    normalizeString(runtimePortfolio.consoleAppId.value)
  )
  const authorizedPortfolioId = computed(() =>
    normalizeString(runtimePortfolio.entity.value?.id)
  )
  const canRead = computed(() =>
    Boolean(
      runtimePortfolio.canRead.value &&
        portfolioId.value &&
        consoleAppId.value &&
        authorizedPortfolioId.value === portfolioId.value
    )
  )
  const collectionPath = computed(() =>
    runtimePortfolio.dataType.value === 'live' && canRead.value
      ? PropertyStorage.rootCollection
      : ''
  )
  const propertyQuery = computed<Query<Property> | null>(() => {
    if (!collectionPath.value) return null
    return query(
      collection(db, PropertyStorage.rootCollection),
      where('portfolio_id', '==', portfolioId.value),
      where('console.app_id', '==', consoleAppId.value)
    ) as Query<Property>
  })
  const source = firestoreQuery<Property>(
    propertyQuery,
    undefined,
    collectionPath
  )
  const properties = computed<Property[]>(() => {
    if (runtimePortfolio.isDemo.value) {
      return (runtimePortfolio.scenario.value?.properties ?? []).map(
        (property) => ({ ...property })
      )
    }

    return (source.value ?? []).reduce<Property[]>((items, property) => {
      const root = canonicalPropertyRoot(property)
      if (root && propertyRootBelongsToApp(root, consoleAppId.value))
        items.push(root)
      return items
    }, [])
  })
  const invalidRootIds = computed(() =>
    (source.value ?? []).reduce<string[]>((ids, property) => {
      if (canonicalPropertyRoot(property)) return ids
      ids.push(normalizeString(property.id) || '(missing-id)')
      return ids
    }, [])
  )
  const invalidScopeIds = computed(() =>
    (source.value ?? []).reduce<string[]>((ids, property) => {
      const root = canonicalPropertyRoot(property)
      if (!root || propertyRootBelongsToApp(root, consoleAppId.value)) return ids
      ids.push(root.id)
      return ids
    }, [])
  )
  const error = computed<unknown | undefined>(() => {
    if (source.error.value) return source.error.value
    if (invalidRootIds.value.length) {
      return new Error(
        `[fireux-properties] invalid Portfolio Property root(s): ${invalidRootIds.value.join(', ')}`
      )
    }
    if (invalidScopeIds.value.length) {
      return new Error(
        `[fireux-properties] Portfolio Property root/App scope mismatch: ${invalidScopeIds.value.join(', ')}`
      )
    }
    return undefined
  })
  const outcome = computed(() => {
    if (error.value) return 'error' as const
    if (runtimePortfolio.isDemo.value) {
      return properties.value.length ? ('ready' as const) : ('empty' as const)
    }
    return source.outcome.value
  })

  return {
    portfolioId,
    consoleAppId,
    canRead,
    collectionPath,
    collection: properties,
    count: computed(() => properties.value.length),
    pending: computed(() =>
      runtimePortfolio.isDemo.value ? false : source.pending.value
    ),
    error,
    outcome,
  }
}
