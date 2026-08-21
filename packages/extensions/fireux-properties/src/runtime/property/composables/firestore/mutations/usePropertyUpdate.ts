// Concurrent edit — 2026-07-20 22:32 CEST — Both-Entity Authority — Property: keep identity and private-manual updates on fixed paths; withhold access mutation.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: use the explicit Property App support path.
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  PropertyManualStorage,
  PropertyStorage,
  type Property,
  type PropertyManual,
  type PropertyUpdateInput,
} from '../../../models/property.model.ts'
import { canonicalPropertyManual } from '../utils/view/usePropertyInterface'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  const requirePropertyId = (value: unknown) => {
    const propertyId = normalizeString(value)
    if (!propertyId) {
      throw new Error('[fireux-properties] property id is required.')
    }
    return propertyId
  }

  async function updatePropertyRoot(input: {
    propertyId: string
    changes: PropertyUpdateInput
  }): Promise<void> {
    await updateDocument<Property>(
      PropertyStorage.rootCollection,
      requirePropertyId(input.propertyId),
      input.changes
    )
  }

  async function updatePropertyManual(input: {
    propertyId: string
    changes: PropertyManual
  }): Promise<void> {
    const resolvedPropertyId = requirePropertyId(input.propertyId)
    const manual = canonicalPropertyManual(input.changes)
    if (!manual) {
      throw new Error(
        '[fireux-properties] complete Property manual input is required.'
      )
    }
    await updateDocument<PropertyManual>(
      `${PropertyStorage.rootCollection}/${resolvedPropertyId}/${PropertyManualStorage.collection}`,
      PropertyManualStorage.documentId,
      manual
    )
  }

  return {
    updatePropertyRoot,
    updatePropertyManual,
  }
}
