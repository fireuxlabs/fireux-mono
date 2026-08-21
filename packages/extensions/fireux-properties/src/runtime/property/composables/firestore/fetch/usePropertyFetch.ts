// Concurrent edit — 2026-07-20 22:32 CEST — Both-Entity Authority — Property: expose fixed root, access, and private-manual reads with schema errors.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: read Property App support through explicit storage names.
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, type Ref } from 'vue'
import {
  PropertyStorage,
  PropertyManualStorage,
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
    normalizeString(
      typeof propertyId === 'string' ? propertyId : propertyId.value
    )
  )
  const collectionPath = computed(() => PropertyStorage.rootCollection)
  const source = firestoreFetchDoc<Property>(collectionPath, resolvedPropertyId)
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
    schemaError.value ? ('error' as const) : source.outcome.value
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

export function usePropertyManualFetch(
  propertyId: string | Ref<string | null | undefined>
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const resolvedPropertyId = computed(() =>
    normalizeString(
      typeof propertyId === 'string' ? propertyId : propertyId.value
    )
  )
  const collectionPath = computed(() => {
    return resolvedPropertyId.value
      ? `${PropertyStorage.rootCollection}/${resolvedPropertyId.value}/${PropertyManualStorage.collection}`
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
    schemaError.value ? ('error' as const) : source.outcome.value
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
