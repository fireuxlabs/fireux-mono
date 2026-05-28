import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import {
  PropertyStorage,
  type Property,
  type PropertyUpdateInput,
} from '../../../../../models/property.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyUpdate(
  options: { shape?: 'root' | 'overlay'; collectionPath?: string } = {}
) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()
  const collectionPath = () =>
    normalizeString(options.collectionPath) ||
    (options.shape === 'overlay'
      ? `${AppStorage.collection}/${normalizeString(appId)}/${PropertyStorage.overlayCollection}`
      : PropertyStorage.rootCollection)

  async function updateProperty(
    propertyId: string,
    patch: PropertyUpdateInput
  ): Promise<void> {
    const resolvedPropertyId = normalizeString(propertyId)
    if (!resolvedPropertyId) {
      throw new Error('[fireux-properties] property id is required.')
    }

    await updateDocument<Property>(collectionPath(), resolvedPropertyId, patch)
  }

  return {
    updateProperty,
  }
}
