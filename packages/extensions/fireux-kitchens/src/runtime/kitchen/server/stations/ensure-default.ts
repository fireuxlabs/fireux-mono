import type { H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor, requireKitchenMutationAuthority } from '../core/mutation-authority'
import { createDefaultKitchenStation, kitchenStationsTarget } from './default'

export async function ensureDefaultKitchenStation(event: H3Event, input: { kitchenId?: string }) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const authority = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const existing = await tx.read(kitchenStationsTarget(kitchenId), 'pass')
    if (!existing.exists) createDefaultKitchenStation(tx, kitchenId,
      serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }))
    return { id: 'pass', created: !existing.exists }
  })
}
