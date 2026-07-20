// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Property: expose fixed canonical-root and app-overlay reads.
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { computed, type Ref } from 'vue'
import {
  PropertyStorage,
  type AppProperty,
  type Property,
} from '../../../../../models/property.model'
import { canonicalPropertyRoot } from '../utils/view/usePropertyInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyFetch(
  propertyId: string | Ref<string | null | undefined>
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const resolvedPropertyId = computed(() =>
    normalizeString(typeof propertyId === 'string' ? propertyId : propertyId.value)
  )
  const collectionPath = computed(() => PropertyStorage.rootCollection)
  const source = firestoreFetchDoc<Property>(
    collectionPath,
    resolvedPropertyId
  )
  const property = computed(() => canonicalPropertyRoot(source.value))

  return {
    collectionPath,
    property,
    exists: computed(() => Boolean(property.value)),
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}

export function useAppPropertyFetch(
  propertyId: string | Ref<string | null | undefined>
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const resolvedPropertyId = computed(() =>
    normalizeString(typeof propertyId === 'string' ? propertyId : propertyId.value)
  )
  const collectionPath = computed(() => {
    const resolvedAppId = normalizeString(appId)
    return resolvedAppId
      ? `${AppStorage.collection}/${resolvedAppId}/${PropertyStorage.overlayCollection}`
      : ''
  })
  const source = firestoreFetchDoc<AppProperty>(collectionPath, resolvedPropertyId)
  const appProperty = computed(() => source.value)

  return {
    collectionPath,
    appProperty,
    exists: computed(() => Boolean(appProperty.value)),
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
