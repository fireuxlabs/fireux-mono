import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import { serverKitchenMenusTarget } from '../../../kitchen/server/mutation-targets'
import { createKitchenSystemMenus } from './starter'

/** Menu Hosting prepares a draft on explicit publication from an empty Kitchen. */
export async function prepareKitchenDocumentMenu(
  event: H3Event,
  input: unknown
) {
  const kitchenId = requireFirestoreDocumentId(input, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenMenusTarget(kitchenId)
    const menus = await tx.readAll(target, 1)
    if (menus.length) return
    const created = serverAuditStamp({
      by: actor.uid,
      appId: actor.runtimeAppId,
    })
    createKitchenSystemMenus({
      mutations: tx,
      target,
      kitchenId,
      menus,
      created,
    })
  })
  return { ok: true }
}
