// Concurrent edit — 2026-07-20 22:32 CEST — Both-Entity Authority — Property: expose fixed root, access, and private-manual reads with schema errors.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: read Property App support through explicit storage names.
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import { computed, type Ref } from 'vue'
import {
  PropertyStorage,
  PropertyManualStorage,
  type AppProperty,
  type Property,
  type PropertyManualRecord,
} from '../../../models/property.model.ts'
import {
  canonicalPropertyManual,
  canonicalPropertyRoot,
} from '../utils/view/usePropertyInterface'

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
  const schemaError = computed(() =>
    source.value && !property.value
      ? new Error(
          `[fireux-properties] invalid canonical Property root: ${resolvedPropertyId.value}`
        )
      : undefined
  )
  const error = computed(() => source.error.value ?? schemaError.value)
  const outcome = computed(() =>
    schemaError.value ? 'error' as const : source.outcome.value
  )

  return {
    collectionPath,
    property,
    exists: computed(() => Boolean(property.value)),
    pending: source.pending,
    error,
    outcome,
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
      ? `${AppStorage.collection}/${resolvedAppId}/${PropertyStorage.appSupportCollection}`
      : ''
  })
  const source = firestoreFetchDoc<AppProperty>(collectionPath, resolvedPropertyId)
  const appProperty = computed<AppProperty | null>(() => {
    const value = source.value
    const id = normalizeString(value?.id)
    if (!value || !id || !value.created || !value.updated) return null

    return {
      id,
      operator_ids: Array.isArray(value.operator_ids)
        ? value.operator_ids.map(normalizeString).filter(Boolean)
        : [],
      team_ids: Array.isArray(value.team_ids)
        ? value.team_ids.map(normalizeString).filter(Boolean)
        : [],
      join_requests: Array.isArray(value.join_requests)
        ? value.join_requests.map(normalizeString).filter(Boolean)
        : [],
      created: value.created,
      updated: value.updated,
    }
  })
  const schemaError = computed(() =>
    source.value && !appProperty.value
      ? new Error(
          `[fireux-properties] invalid AppProperty access record: ${resolvedPropertyId.value}`
        )
      : undefined
  )
  const error = computed(() => source.error.value ?? schemaError.value)
  const outcome = computed(() =>
    schemaError.value ? 'error' as const : source.outcome.value
  )

  return {
    collectionPath,
    appProperty,
    exists: computed(() => Boolean(appProperty.value)),
    pending: source.pending,
    error,
    outcome,
  }
}

export function usePropertyManualFetch(
  propertyId: string | Ref<string | null | undefined>
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const resolvedPropertyId = computed(() =>
    normalizeString(typeof propertyId === 'string' ? propertyId : propertyId.value)
  )
  const collectionPath = computed(() => {
    const resolvedAppId = normalizeString(appId)
    return resolvedAppId && resolvedPropertyId.value
      ? `${AppStorage.collection}/${resolvedAppId}/${PropertyStorage.appSupportCollection}/${resolvedPropertyId.value}/${PropertyManualStorage.collection}`
      : ''
  })
  const source = firestoreFetchDoc<PropertyManualRecord>(
    collectionPath,
    PropertyManualStorage.documentId
  )
  const manual = computed(() => canonicalPropertyManual(source.value))
  const schemaError = computed(() =>
    source.value && !manual.value
      ? new Error(
          `[fireux-properties] invalid private Property manual: ${resolvedPropertyId.value}`
        )
      : undefined
  )
  const error = computed(() => source.error.value ?? schemaError.value)
  const outcome = computed(() =>
    schemaError.value ? 'error' as const : source.outcome.value
  )

  return {
    collectionPath,
    manual,
    exists: computed(() => Boolean(manual.value)),
    pending: source.pending,
    error,
    outcome,
  }
}
