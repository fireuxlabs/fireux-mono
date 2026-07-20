// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Property: expose typed fixed-path root and operational-overlay updates.
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import {
  PropertyStorage,
  type AppProperty,
  type AppPropertyUpdateInput,
  type Property,
  type PropertyUpdateInput,
} from '../../../../../models/property.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()

  const requirePropertyId = (value: unknown) => {
    const propertyId = normalizeString(value)
    if (!propertyId) {
      throw new Error('[fireux-properties] property id is required.')
    }
    return propertyId
  }

  const requireAppPropertyCollection = () => {
    const resolvedAppId = normalizeString(appId)
    if (!resolvedAppId) {
      throw new Error('[fireux-properties] app id is required for AppProperty updates.')
    }
    return `${AppStorage.collection}/${resolvedAppId}/${PropertyStorage.overlayCollection}`
  }

  async function updatePropertyRoot(
    propertyId: string,
    patch: PropertyUpdateInput
  ): Promise<void> {
    await updateDocument<Property>(
      PropertyStorage.rootCollection,
      requirePropertyId(propertyId),
      patch
    )
  }

  async function updatePropertyOverlay(
    propertyId: string,
    patch: AppPropertyUpdateInput
  ): Promise<void> {
    await updateDocument<AppProperty>(
      requireAppPropertyCollection(),
      requirePropertyId(propertyId),
      patch
    )
  }

  return {
    updatePropertyRoot,
    updatePropertyOverlay,
  }
}
