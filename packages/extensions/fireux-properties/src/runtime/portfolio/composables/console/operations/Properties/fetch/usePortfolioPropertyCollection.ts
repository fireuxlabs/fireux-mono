// Concurrent edit — 2026-07-20 23:03 CEST — Both-Entity Authority — Property: query only current-App roots after ready Portfolio access.
import { collection, query, where, type Query } from 'firebase/firestore'
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useActivePortfolio } from '../../useActivePortfolio'
import {
  PropertyStorage,
  type Property,
} from '../../../../../../property/models/property.model.ts'
import { canonicalPropertyRoot } from '../../../../../../property/composables/firestore/utils/view/usePropertyInterface'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const propertyBelongsToApp = (
  property: Property,
  appId: string,
  ecosystem: string
) => {
  const management = readFireuxEntityManagement(property.management)
  return Boolean(
    management &&
    management.mode !== 'root' &&
    resolveFireuxEntityManagementAppId(management, ecosystem) === appId
  )
}

export function usePortfolioPropertyCollection(
  runtimePortfolio = useActivePortfolio()
) {
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()
  const portfolioId = computed(() => normalizeString(runtimePortfolio.id.value))
  const appId = computed(() => normalizeString(runtimePortfolio.appId.value))
  const ecosystem = computed(() =>
    normalizeString(runtimePortfolio.ecosystem.value)
  )
  const authorizedPortfolioId = computed(() =>
    normalizeString(runtimePortfolio.entity.value?.id)
  )
  const canRead = computed(() =>
    Boolean(
      runtimePortfolio.canRead.value &&
        portfolioId.value &&
        appId.value &&
        ecosystem.value &&
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
      where('portfolio_id', '==', portfolioId.value)
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
      if (root && propertyBelongsToApp(root, appId.value, ecosystem.value))
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
      if (!root || propertyBelongsToApp(root, appId.value, ecosystem.value)) return ids
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
    ecosystem,
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
