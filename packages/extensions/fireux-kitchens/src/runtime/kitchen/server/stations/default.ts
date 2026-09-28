import { assertFirestoreMutationSegment, defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'

export const kitchenStationsTarget = (kitchenId: string) => defineFirestoreMutationTarget({
  key: 'kitchens.stations', lane: 'server', verbs: ['create'],
  database: { kind: 'runtime' },
  collectionPath: `kitchens/${assertFirestoreMutationSegment(kitchenId, 'kitchenId')}/stations`,
})

export function createDefaultKitchenStation(
  tx: GuardedServerTransaction, kitchenId: string,
  created: ReturnType<typeof serverAuditStamp>
) {
  tx.create(kitchenStationsTarget(kitchenId), 'pass', {
    kitchen_id: kitchenId, name: 'Pass', description: '', active: true,
    sort_order: 0, created, updated: created,
  })
}
