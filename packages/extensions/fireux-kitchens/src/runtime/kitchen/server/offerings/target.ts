import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'

export function serverKitchenOfferingsTarget(kitchenId: string) {
  const id = requireFirestoreDocumentId(kitchenId, 'Kitchen id')
  return defineFirestoreMutationTarget({
    key: 'kitchens.offerings',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${id}/offerings`,
  })
}
