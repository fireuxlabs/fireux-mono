import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'

export function serverKitchenOrderNumberingTarget(kitchenId: string) {
  const id = requireFirestoreDocumentId(kitchenId, 'Kitchen id')
  return defineFirestoreMutationTarget({
    key: 'kitchens.order-service',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${id}/order-service`,
  })
}
