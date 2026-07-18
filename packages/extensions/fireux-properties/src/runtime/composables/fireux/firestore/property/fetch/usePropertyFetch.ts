import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { computed, type Ref } from 'vue'
import { PropertyStorage, type Property } from '../../../../../models/property.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyFetch(
  propertyId: string | Ref<string | null | undefined>,
  options: {
    shape?: 'root' | 'overlay'
    collectionPath?: string
  } = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const resolvedPropertyId = computed(() =>
    normalizeString(typeof propertyId === 'string' ? propertyId : propertyId.value)
  )
  const collectionPath = computed(() => {
    if (normalizeString(options.collectionPath)) return normalizeString(options.collectionPath)
    if (options.shape === 'overlay') {
      const resolvedAppId = normalizeString(appId)
      return resolvedAppId
        ? `${AppStorage.collection}/${resolvedAppId}/${PropertyStorage.overlayCollection}`
        : ''
    }
    return PropertyStorage.rootCollection
  })
  const source = firestoreFetchDoc<Property>(
    collectionPath,
    resolvedPropertyId
  )
  const property = computed(() => source.value)

  return {
    collectionPath,
    property,
    exists: computed(() => Boolean(property.value)),
    pending: source.pending,
    error: source.error,
    outcome: source.outcome,
  }
}
