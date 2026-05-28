import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { PropertyStorage } from '../../../../../models/property.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyDelete(
  options: { shape?: 'root' | 'overlay'; collectionPath?: string } = {}
) {
  const { deleteDocument } = useFirestoreDelete()
  const { appId } = useFireUXConfig()
  const collectionPath = () =>
    normalizeString(options.collectionPath) ||
    (options.shape === 'overlay'
      ? `${AppStorage.collection}/${normalizeString(appId)}/${PropertyStorage.overlayCollection}`
      : PropertyStorage.rootCollection)

  async function deleteProperty(propertyId: string): Promise<void> {
    const resolvedPropertyId = normalizeString(propertyId)
    if (!resolvedPropertyId) {
      throw new Error('[fireux-properties] property id is required.')
    }

    await deleteDocument(collectionPath(), resolvedPropertyId)
  }

  return {
    deleteProperty,
  }
}
