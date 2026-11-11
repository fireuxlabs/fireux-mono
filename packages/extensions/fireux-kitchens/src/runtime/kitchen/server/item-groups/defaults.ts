import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { kitchenItemGroupsTarget } from './targets'
import type { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'

/** Onboarding suggestions become ordinary editable records, only with a new Kitchen root. */
export function createDefaultKitchenItemGroups(
  tx: GuardedServerTransaction,
  kitchenId: string,
  stamp: ReturnType<typeof serverAuditStamp>
) {
  for (const [sort_order, name] of ['Food', 'Drinks'].entries()) {
    tx.create(kitchenItemGroupsTarget(kitchenId), name.toLowerCase(), {
      kitchen_id: kitchenId,
      name,
      active: true,
      sort_order,
      default_station_ids: [],
      created: stamp,
      updated: stamp,
    })
  }
}
