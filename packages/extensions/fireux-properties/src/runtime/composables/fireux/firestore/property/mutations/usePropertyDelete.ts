// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Property: remove caller-selected delete scopes and paths.
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { PropertyStorage } from '../../../../../models/property.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyDelete() {
  const { deleteDocument } = useFirestoreDelete()
  const { appId } = useFireUXConfig()

  const requirePropertyId = (value: unknown) => {
    const propertyId = normalizeString(value)
    if (!propertyId) {
      throw new Error('[fireux-properties] property id is required.')
    }
    return propertyId
  }

  async function deletePropertyRoot(propertyId: string): Promise<void> {
    await deleteDocument(
      PropertyStorage.rootCollection,
      requirePropertyId(propertyId)
    )
  }

  async function deletePropertyOverlay(propertyId: string): Promise<void> {
    const resolvedAppId = normalizeString(appId)
    if (!resolvedAppId) {
      throw new Error('[fireux-properties] app id is required for AppProperty deletion.')
    }

    await deleteDocument(
      `${AppStorage.collection}/${resolvedAppId}/${PropertyStorage.overlayCollection}`,
      requirePropertyId(propertyId)
    )
  }

  return {
    deletePropertyRoot,
    deletePropertyOverlay,
  }
}
